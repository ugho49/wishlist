import { expect } from '@jest/globals'
import { DataSource } from 'typeorm'

import 'jest-expect-message'

type Assertion = () => Promise<unknown>

export class TableAssert {
  private assertions = new Set<Assertion>()

  constructor(
    public readonly datasource: DataSource,
    public readonly tableName: string,
  ) {}

  hasNumberOfRows(expected: number): this {
    this.assertions.add(async () => {
      const count = await this.datasource
        .query(`SELECT COUNT(*) FROM ${this.tableName}`)
        .then(result => parseInt(result[0].count, 10))

      expect(count).toEqual(expected)
    })

    return this
  }

  row(index: number): TableRowAssert {
    return new TableRowAssert(this, index, assertion => this.assertions.add(assertion))
  }

  async check() {
    for (const assertion of this.assertions) {
      await assertion()
    }
  }
}

class TableRowAssert {
  private cachedRowValues: Record<string, unknown> | undefined = undefined
  private rowFetched: boolean = false

  constructor(
    public readonly tableAssert: TableAssert,
    public readonly index: number,
    private readonly addAssertion: (assertion: Assertion) => void,
  ) {}

  value(column: string): TableRowValueAssert {
    const getValue = async () => {
      const row = await this.fetchOrGetCachedRowValues()
      // eslint-disable-next-line security/detect-object-injection
      return row ? row[column] : undefined
    }

    return new TableRowValueAssert(this, getValue, this.addAssertion)
  }

  toMatchObject(expected: Record<string, unknown>): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.fetchOrGetCachedRowValues()
      expect(value).toMatchObject(expected)
    })

    return this
  }

  toEqual(expected: Record<string, unknown>): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.fetchOrGetCachedRowValues()
      expect(value).toEqual(expected)
    })

    return this
  }

  row(i: number) {
    return this.tableAssert.row(i)
  }

  check() {
    return this.tableAssert.check()
  }

  private async fetchOrGetCachedRowValues(): Promise<Record<string, unknown> | undefined> {
    if (this.rowFetched) {
      return this.cachedRowValues
    }

    this.cachedRowValues = await this.tableAssert.datasource
      .query(`SELECT * FROM ${this.tableAssert.tableName} OFFSET ${this.index} LIMIT 1`)
      .then(result => (result.length === 1 ? result[0] : undefined))

    return this.cachedRowValues
  }
}

class TableRowValueAssert {
  constructor(
    private readonly tableRowAssert: TableRowAssert,
    private readonly getValue: () => Promise<unknown>,
    private readonly addAssertion: (assertion: Assertion) => void,
  ) {}

  toEqual(expected: unknown): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.getValue()
      expect(value).toEqual(expected)
    })

    return this.tableRowAssert
  }

  toNotEqual(expected: unknown): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.getValue()
      expect(value).not.toEqual(expected)
    })

    return this.tableRowAssert
  }

  toBeNull(): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.getValue()
      expect(value).toBeNull()
    })

    return this.tableRowAssert
  }

  toBeNotNull(): TableRowAssert {
    this.addAssertion(async () => {
      const value = await this.getValue()
      expect(value).not.toBeNull()
    })

    return this.tableRowAssert
  }
}
