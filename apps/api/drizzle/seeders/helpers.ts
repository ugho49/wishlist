import { faker } from '@faker-js/faker';

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
