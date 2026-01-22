import z from 'zod'

import { LinkUserToGoogleInput, RegisterUserInput, UpdateUserInput } from './user.dto'

export const UpdateUserInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  birthday: z.iso
    .date({ message: 'must be in format YYYY-MM-DD' })
    .transform(value => new Date(value))
    .optional(),
}) satisfies z.ZodType<UpdateUserInput>

export const RegisterUserInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  email: z.email().transform(value => value.toLowerCase()),
  password: z.string().min(8).max(50),
  birthday: z.iso
    .date({ message: 'must be in format YYYY-MM-DD' })
    .transform(value => new Date(value))
    .optional(),
}) satisfies z.ZodType<RegisterUserInput>

export const LinkUserToGoogleInputSchema = z.object({
  code: z.string(),
}) satisfies z.ZodType<LinkUserToGoogleInput>
