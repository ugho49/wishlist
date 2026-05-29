import { EventId, UserId, WishlistId } from '@wishlist/common'
import z from 'zod'

import { AddWishlistCoOwnerInput, AdminWishlistPaginationFilters, UpdateWishlistInput } from '../../gql/generated-types'

export const WishlistIdSchema = z.string().transform(val => val as WishlistId)
export const EventIdSchema = z.string().transform(val => val as EventId)
export const UserIdSchema = z.string().transform(val => val as UserId)

export const UpdateWishlistInputSchema = z.object({
  title: z.string().nonempty().max(100),
  description: z.string().max(2000).optional(),
}) satisfies z.ZodType<UpdateWishlistInput>

export const AddWishlistCoOwnerInputSchema = z.object({
  userId: UserIdSchema,
}) satisfies z.ZodType<AddWishlistCoOwnerInput>

export const AdminWishlistPaginationFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  userId: UserIdSchema,
}) satisfies z.ZodType<AdminWishlistPaginationFilters>
