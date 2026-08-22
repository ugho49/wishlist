import type { SQL } from 'bun';

import { expect } from 'bun:test';

type DbAssertion = () => Promise<unknown>;

type FetchValueResult = {
  value: Record<string, unknown> | undefined;
  index: number;
  tableName: string;
};

export type TableAssertSortOptions = Record<string, 'ASC' | 'DESC'>;

export class TableAssert {
  private readonly assertions = new Set<DbAssertion>();
  private readonly cachedRows = new Map<number, FetchValueResult['value']>();

  constructor(
    private readonly sql: SQL,
    private readonly tableName: string,
    private readonly sortOptions?: TableAssertSortOptions,
  ) {}

  hasNumberOfRows(expected: number): this {
    this.assertions.add(async () => {
      const raw = await this.sql.unsafe(`SELECT COUNT(*) FROM ${this.tableName}`);

      const count = Number(raw[0]?.count);

      expect(count, `Wrong number of rows for table ${this.tableName}`).toEqual(expected);
    });

    return this;
  }

  row(index = 0): TableRowAssert {
    return new TableRowAssert(
      this,
      () => this.fetchValue(index),
      assertion => this.assertions.add(assertion),
    );
  }

  /**
   * If you await your assertions, you don't need to call this method.
   *
   * @example
   *
   * ```ts
   * await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1).check()
   *
   * // Same as:
   * await expectTable(Fixtures.ITEM_TABLE).hasNumberOfRows(1)
   * ```
   */
  async check() {
    for (const assertion of this.assertions) {
      await assertion();
    }
  }

  // Thenable pattern: allow to chain assertions with await without a check() call
  // biome-ignore lint/suspicious/noThenProperty: Thenable pattern expected here
  then(onFulfilled: () => unknown, onRejected?: (error: unknown) => unknown): Promise<unknown> {
    return this.check().then(onFulfilled, onRejected);
  }

  private async fetchValue(index: number): Promise<FetchValueResult> {
    const returnValue: FetchValueResult = {
      value: undefined,
      index,
      tableName: this.tableName,
    };

    if (this.cachedRows.has(index)) {
      return { ...returnValue, value: this.cachedRows.get(index) };
    }

    const orderBy = this.sortOptions
      ? `ORDER BY ${Object.entries(this.sortOptions)
          .map(([column, order]) => `${column} ${order}`)
          .join(', ')}`
      : '';

    const result = await this.sql.unsafe(`SELECT * FROM ${this.tableName} ${orderBy} OFFSET ${index} LIMIT 1`);

    const value = result.length === 1 ? decodePgRow(result[0] as Record<string, unknown>) : undefined;
    this.cachedRows.set(index, value);

    return { ...returnValue, value };
  }
}

function decodePgRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, decodePgValue(value)]));
}

function decodePgValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (value.startsWith('{') && value.endsWith('}')) {
    return parsePgArray(value);
  }

  return value;
}

function parsePgArray(literal: string): string[] {
  const inner = literal.slice(1, -1);
  if (!inner) {
    return [];
  }

  return inner.split(',').map(item => {
    const trimmed = item.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1).replaceAll('\\"', '"');
    }
    return trimmed;
  });
}

class TableRowAssert {
  constructor(
    private readonly parent: TableAssert,
    private readonly fetchValue: () => Promise<FetchValueResult>,
    private readonly addAssertion: (assertion: DbAssertion) => void,
  ) {}

  toEqual(expected: Record<string, unknown>): this {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue();
      expect(value, `Wrong value for row[${index}] of table ${tableName}`).toEqual(expected);
    });

    return this;
  }

  toMatchObject(expected: Record<string, unknown>): this {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue();
      expect(value, `Wrong value for row[${index}] of table ${tableName}`).toMatchObject(expected);
    });

    return this;
  }

  expectColumn<T>(columnName: string, checker: (value: T | undefined) => unknown | Promise<unknown>): this {
    this.addAssertion(async () => {
      const { value } = await this.fetchValue();
      const columnValue = value?.[columnName] as T | undefined;

      await checker(columnValue);
    });

    return this;
  }

  row(index = 0): TableRowAssert {
    return this.parent.row(index);
  }

  /**
   * If you await your assertions, you don't need to call this method.
   *
   * @example
   *
   * ```ts
   * await expectTable(Fixtures.ITEM_TABLE).row(0).toEqual({ id: '1', name: 'Item 1' }).check()
   *
   * // Same as:
   * await expectTable(Fixtures.ITEM_TABLE).row(0).toEqual({ id: '1', name: 'Item 1' })
   * ```
   */
  check() {
    return this.parent.check();
  }

  // Thenable pattern: allow to chain assertions with await without a check() call
  // biome-ignore lint/suspicious/noThenProperty: Thenable pattern expected here
  then(onFulfilled: () => unknown, onRejected?: (error: unknown) => unknown): Promise<unknown> {
    return this.check().then(onFulfilled, onRejected);
  }
}
