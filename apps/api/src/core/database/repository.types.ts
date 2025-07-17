/**
 * @deprecated: will be replaced by drizzle
 */
export type PartialEntity<T> = Partial<Omit<T, 'id' | 'createdAt'>>
