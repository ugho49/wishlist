import type { CreateItemInput, ScanItemUrlInput, UpdateItemInput } from '../../gql/generated-types'

import { ItemId, WishlistId } from '@wishlist/common'
import z from 'zod'

export const ItemIdSchema = z.string().transform(val => val as ItemId)

export const WishlistIdSchema = z.string().transform(val => val as WishlistId)

export const CreateItemInputSchema = z.object({
  wishlistId: WishlistIdSchema,
  name: z.string().nonempty().max(40),
  description: z.string().max(120).optional(),
  url: z.string().url().max(1000).optional(),
  score: z.number().int().min(0).max(5).optional(),
  pictureUrl: z.string().url().max(1000).optional(),
}) satisfies z.ZodType<CreateItemInput>

export const UpdateItemInputSchema = z.object({
  name: z.string().nonempty().max(40),
  description: z.string().max(120).optional(),
  url: z.string().url().max(1000).optional(),
  score: z.number().int().min(0).max(5).optional(),
  pictureUrl: z.string().url().max(1000).optional(),
}) satisfies z.ZodType<UpdateItemInput>

export const ScanItemUrlInputSchema = z.object({
  url: z.string().nonempty(),
}) satisfies z.ZodType<ScanItemUrlInput>
