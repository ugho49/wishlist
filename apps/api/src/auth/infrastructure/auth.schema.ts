import z from 'zod'

import { LoginInput, LoginWithGoogleInput } from '../../gql/generated-types'

export const LoginInputSchema = z.object({
  email: z.email().transform(value => value.toLowerCase()),
  password: z.string(),
}) satisfies z.ZodType<LoginInput>

export const LoginWithGoogleInputSchema = z.object({
  code: z.string(),
  createUserIfNotExists: z.boolean(),
}) satisfies z.ZodType<LoginWithGoogleInput>
