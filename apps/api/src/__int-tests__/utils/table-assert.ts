import type { DataSource } from 'typeorm'

type DbAssertion = () => Promise<unknown>

type FetchValueResult = {
  value: Record<string, unknown> | undefined
  index: number
  tableName: string
}

export type TableAssertSortOptions = Record<string, 'ASC' | 'DESC'>

export class TableAssert {
  private assertions = new Set<DbAssertion>()
  private cachedRows = new Map<number, FetchValueResult['value']>()

  constructor(
    private readonly datasource: DataSource,
    private readonly tableName: string,
    private readonly sortOptions?: TableAssertSortOptions,
  ) {}

  hasNumberOfRows(expected: number): this {
    this.assertions.add(async () => {
      const count = await this.datasource
        .query(`SELECT COUNT(*) FROM ${this.tableName}`)
        .then(result => parseInt(result[0].count, 10))

      expect(count, `Wrong number of rows for table ${this.tableName}`).toEqual(expected)
    })

    return this
  }

  row(index: number = 0): TableRowAssert {
    return new TableRowAssert(
      this,
      () => this.fetchValue(index),
      assertion => this.assertions.add(assertion),
    )
  }

  async check() {
    for (const assertion of this.assertions) {
      await assertion()
    }
  }

  private async fetchValue(index: number): Promise<FetchValueResult> {
    const returnValue: FetchValueResult = {
      value: undefined,
      index,
      tableName: this.tableName,
    }

    if (this.cachedRows.has(index)) {
      return { ...returnValue, value: this.cachedRows.get(index) }
    }

    const orderBy = this.sortOptions
      ? `ORDER BY ${Object.entries(this.sortOptions)
          .map(([column, order]) => `${column} ${order}`)
          .join(', ')}`
      : ''

    const result = await this.datasource.query(`SELECT * FROM ${this.tableName} ${orderBy} OFFSET ${index} LIMIT 1`)
    const value = result.length === 1 ? result[0] : undefined
    this.cachedRows.set(index, value)

    return { ...returnValue, value }
  }
}

class TableRowAssert {
  constructor(
    private readonly parent: TableAssert,
    private readonly fetchValue: () => Promise<FetchValueResult>,
    private readonly addAssertion: (assertion: DbAssertion) => void,
  ) {}

  toEqual(expected: Record<string, unknown>): TableAssert {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue()
      expect(value, `Wrong value for row[${index}] of table ${tableName}`).toEqual(expected)
    })

    return this.parent
  }

  toMatchObject(expected: Record<string, unknown>): this {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue()
      expect(value, `Wrong value for row[${index}] of table ${tableName}`).toMatchObject(expected)
    })

    return this
  }

  expectColumn<T>(columnName: string, checker: (value: T | undefined) => unknown | Promise<unknown>): this {
    this.addAssertion(async () => {
      const { value } = await this.fetchValue()
      const columnValue = value?.[columnName] as T | undefined

      await checker(columnValue)
    })

    return this
  }

  row(index: number = 0): TableRowAssert {
    return this.parent.row(index)
  }

  check() {
    return this.parent.check()
  }
}
