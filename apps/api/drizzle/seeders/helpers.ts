import type { InferInsertModel } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { SeedDb } from './types';

import { faker } from '@faker-js/faker';
import { getTableColumns } from 'drizzle-orm';

/** PostgreSQL bind-parameter limit for a single query. */
const PG_MAX_QUERY_PARAMS = 65_535;

export async function insertInBatches<TTable extends PgTable>(
  db: SeedDb,
  table: TTable,
  rows: readonly InferInsertModel<TTable>[],
): Promise<void> {
  if (rows.length === 0) return;

  const columnCount = Math.max(1, Object.keys(getTableColumns(table)).length);
  const batchSize = Math.max(1, Math.floor(PG_MAX_QUERY_PARAMS / columnCount));

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await db.insert(table).values(batch);
  }
}

export function uuid(): string {
  return faker.string.uuid();
}

export function chance(probability: number): boolean {
  return faker.datatype.boolean({ probability });
}

export function maybe<T>(probability: number, factory: () => T): T | undefined {
  return chance(probability) ? factory() : undefined;
}

export function pickOne<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('Cannot pick from an empty list');
  }

  return faker.helpers.arrayElement(items);
}

export function intBetween(range: { readonly min: number; readonly max: number }): number {
  return faker.number.int(range);
}

export function groupByKey<T>(items: readonly T[], keyOf: (item: T) => string | null | undefined): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = keyOf(item);
    if (key == null) continue;

    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return grouped;
}
