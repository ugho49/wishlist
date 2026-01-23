import z from 'zod'

import { AdminGetAllUsersPaginationFilters, AdminUpdateUserProfileInput } from '../../gql/generated-types'

export const AdminGetAllUsersPaginationFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  criteria: z.string().optional(),
}) satisfies z.ZodType<AdminGetAllUsersPaginationFilters>

export const AdminUpdateUserProfileInputSchema = z.object({
  email: z.email().max(200).toLowerCase().optional(),
  newPassword: z.string().min(8).max(50).optional(),
  firstname: z.string().nonempty().max(50).optional(),
  lastname: z.string().nonempty().max(50).optional(),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
  isEnabled: z.boolean().optional(),
}) satisfies z.ZodType<AdminUpdateUserProfileInput>
