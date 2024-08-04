import { expect } from '@jest/globals'
import { DataSource } from 'typeorm'

import 'jest-expect-message'

type Assertion = () => Promise<unknown>

type FetchValueResult = Record<string, unknown> | undefined

export class TableAssert {
  private assertions = new Set<Assertion>()

  constructor(
    private readonly datasource: DataSource,
    private readonly tableName: string,
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
    const result = await this.datasource.query(`SELECT * FROM ${this.tableName} OFFSET ${index} LIMIT 1`)
    return result.length === 1 ? result[0] : undefined
  }
}

class TableRowAssert {
  constructor(
    private readonly tableAssert: TableAssert,
    private readonly fetchValue: () => Promise<FetchValueResult>,
    private readonly addAssertion: (assertion: Assertion) => void,
  ) {}

  toMatchObject(expected: Record<string, unknown>): TableAssert {
    this.addAssertion(async () => {
      const value = await this.fetchValue()
      expect(value).toMatchObject(expected)
    })

    return this.tableAssert
  }

  toEqual(expected: Record<string, unknown>): TableAssert {
    this.addAssertion(async () => {
      const value = await this.fetchValue()
      expect(value).toEqual(expected)
    })

    return this.tableAssert
  }
}
