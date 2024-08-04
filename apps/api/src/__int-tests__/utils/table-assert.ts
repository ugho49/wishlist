import 'jest'
import 'jest-expect-message'

import { DataSource } from 'typeorm'

type DbAssertion = () => Promise<unknown>

type FetchValueResult = {
  value: Record<string, unknown> | undefined
  index: number
  tableName: string
}

export class TableAssert {
  private assertions = new Set<DbAssertion>()

  constructor(
    private readonly datasource: DataSource,
    private readonly tableName: string,
  ) {}

  hasNumberOfRows(expected: number): this {
    this.assertions.add(async () => {
      const count = await this.datasource
        .query(`SELECT COUNT(*) FROM ${this.tableName}`)
        .then(result => parseInt(result[0].count, 10))

      expect(count, `Wrong number of rows for table ${this.tableName}`, {
        showMatcherMessage: false,
        showPrefix: false,
        showStack: false,
      }).toEqual(expected)
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
    const result = await this.datasource.query(`SELECT * FROM ${this.tableName} OFFSET ${index} LIMIT 1`)

    return {
      value: result.length === 1 ? result[0] : undefined,
      index,
      tableName: this.tableName,
    }
  }
}

class TableRowAssert {
  constructor(
    private readonly parent: TableAssert,
    private readonly fetchValue: () => Promise<FetchValueResult>,
    private readonly addAssertion: (assertion: DbAssertion) => void,
  ) {}

  toMatchObject(expected: Record<string, unknown>): TableAssert {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue()
      expect(value, `Wrong value for row[${index}] of table ${tableName}`, {
        showPrefix: false,
        showStack: false,
      }).toMatchObject(expected)
    })

    return this.parent
  }

  toEqual(expected: Record<string, unknown>): TableAssert {
    this.addAssertion(async () => {
      const { value, index, tableName } = await this.fetchValue()
      expect(value, `Wrong value for row[${index}] of table ${tableName}`, {
        showPrefix: false,
        showStack: false,
      }).toEqual(expected)
    })

    return this.parent
  }
}
