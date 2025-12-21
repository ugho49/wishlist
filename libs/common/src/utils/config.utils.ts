import { z } from 'zod'

export function mapConfigOrThrow<T, R>(schema: z.ZodType<T>, data: unknown, mapper: (data: T) => R): R {
  const result = schema.safeParse(data)

  if (!result.success) {
    throw new Error(z.prettifyError(result.error))
  }

  return mapper(result.data)
}
