/**
 * Converts a TypeScript enum to a PostgreSQL enum.
 * @param myEnum - The TypeScript enum to convert to a PostgreSQL enum.
 * @returns The PostgreSQL enum values.
 */
export function tsEnumToPgEnum<T extends Record<string, string>>(myEnum: T): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum) as [T[keyof T], ...T[keyof T][]];
}
