export type PartialEntity<T> = Partial<Omit<T, 'id' | 'createdAt'>>
