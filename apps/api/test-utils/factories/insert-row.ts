import type { DrizzleDatabase } from '@wishlist/api/core'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'

type LooseValue<T> = T extends string ? string : T extends (infer U)[] ? LooseValue<U>[] : T

export type LooseInsert<T> = {
  [K in keyof T]?: LooseValue<NonNullable<T[K]>> | Extract<T[K], null | undefined>
}

export async function insertRow<TTable extends PgTable>(
  db: DrizzleDatabase,
  table: TTable,
  values: InferInsertModel<TTable>,
): Promise<InferSelectModel<TTable>> {
  const rows = await db.insert(table).values(values).returning()
  const row = rows[0]

  if (!row) {
    throw new Error('Insert returned no row')
  }

  return row as InferSelectModel<TTable>
}
