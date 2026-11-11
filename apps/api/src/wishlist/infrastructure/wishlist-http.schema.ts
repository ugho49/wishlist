import { type CreateWishlistHttpRequest, type EventId, MAX_EVENTS_BY_LIST } from '@wishlist/common';
import { z } from 'zod';

/** `data` of `POST /wishlist`, with the messages of the previous class-validator DTO. */
export const CreateWishlistHttpRequestSchema = z.object({
  title: z
    .string({ error: 'title should not be empty' })
    .min(1, 'title should not be empty')
    .max(100, 'title must be shorter than or equal to 100 characters'),
  description: z
    .string({ error: 'description must be a string' })
    .max(2000, 'description must be shorter than or equal to 2000 characters')
    .optional(),
  hide_items: z.boolean({ error: 'hide_items must be a boolean value' }).optional(),
  event_ids: z
    .array(
      z.string({ error: 'each value in event_ids must be a string' }).transform(id => id as EventId),
      {
        error: 'event_ids should not be empty',
      },
    )
    .min(1, 'event_ids should not be empty')
    .max(MAX_EVENTS_BY_LIST, `event_ids must contain no more than ${MAX_EVENTS_BY_LIST} elements`),
}) satisfies z.ZodType<CreateWishlistHttpRequest, unknown>;

/** The text fields of the `POST /wishlist` multipart form: `data` is the JSON of the wishlist. */
export const CreateWishlistFormSchema = z.object({
  data: z
    .string({ error: 'data should not be empty' })
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({ code: 'custom', message: 'data must be a valid JSON string' });
        return z.NEVER;
      }
    })
    .pipe(CreateWishlistHttpRequestSchema),
});

export type CreateWishlistForm = z.output<typeof CreateWishlistFormSchema>;
