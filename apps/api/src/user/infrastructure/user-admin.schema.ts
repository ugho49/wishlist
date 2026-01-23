import { UserId } from '@wishlist/common'
import z from 'zod'

import { AdminGetAllUsersInput, AdminUpdateUserProfileInput } from '../../gql/generated-types'

export const AdminGetAllUsersInputSchema = z
  .object({
    pageNumber: z.number().int().min(1).optional(),
    criteria: z.string().optional(),
  })
  .optional() satisfies z.ZodType<AdminGetAllUsersInput | undefined>

export const AdminUpdateUserProfileInputSchema = z.object({
  email: z.email().max(200).toLowerCase().optional(),
  newPassword: z.string().min(8).max(50).optional(),
  firstname: z.string().max(50).optional(),
  lastname: z.string().max(50).optional(),
  birthday: z.string().optional(),
  isEnabled: z.boolean().optional(),
}) satisfies z.ZodType<AdminUpdateUserProfileInput>

export const UserIdSchema = z.string().transform(val => val as UserId)
