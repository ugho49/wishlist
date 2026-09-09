import { type ItemId, type WishlistId } from '@wishlist/common';
import z from 'zod';

import { PaginationFiltersSchema } from '../../core/graphql/common-type.schema';
import {
  type CreateItemInput,
  type ImportItemsInput,
  type ScanItemUrlInput,
  type TakenItemsFilters,
  TakenItemsScope,
  type UpdateItemInput,
} from '../../gql/generated-types';

export const ItemIdSchema = z.string().transform(val => val as ItemId);
export const WishlistIdSchema = z.string().transform(val => val as WishlistId);

export const TakenItemsFiltersSchema = PaginationFiltersSchema.extend({
  scope: z.enum(TakenItemsScope).optional(),
}) satisfies z.ZodType<TakenItemsFilters>;

export const CreateItemInputSchema = z.object({
  wishlistId: WishlistIdSchema,
  name: z.string().nonempty().max(40),
  description: z.string().max(120).optional(),
  url: z.url().max(1000).optional(),
  score: z.number().int().min(0).max(5).optional(),
  price: z.number().nonnegative().max(1_000_000).optional(),
  pictureUrl: z.url().max(1000).optional(),
}) satisfies z.ZodType<CreateItemInput>;

export const UpdateItemInputSchema = z.object({
  name: z.string().nonempty().max(40),
  description: z.string().max(120).optional(),
  url: z.url().max(1000).optional(),
  score: z.number().int().min(0).max(5).optional(),
  price: z.number().nonnegative().max(1_000_000).optional(),
  pictureUrl: z.url().max(1000).optional(),
}) satisfies z.ZodType<UpdateItemInput>;

export const ScanItemUrlInputSchema = z.object({
  url: z.url(),
}) satisfies z.ZodType<ScanItemUrlInput>;

export const ImportItemsInputSchema = z.object({
  wishlistId: WishlistIdSchema,
  sourceItemIds: z.array(ItemIdSchema).min(1),
}) satisfies z.ZodType<ImportItemsInput>;
