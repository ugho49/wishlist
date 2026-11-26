import { type EventId, type UserAccountId, type UserId, type WishlistId } from '@wishlist/common';
import { match } from 'ts-pattern';
import z from 'zod';

import {
  type AdminGetAllUsersPaginationFilters,
  type AdminUpdateUserProfileInput,
  AdminUserMergeSide as GqlAdminUserMergeSide,
} from '../../gql/generated-types';
import { UserMergeSide } from '../domain/user-merge-side.enum';

export const AdminGetAllUsersPaginationFiltersSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  criteria: z.string().optional(),
}) satisfies z.ZodType<AdminGetAllUsersPaginationFilters>;

export const AdminUpdateUserProfileInputSchema = z.object({
  email: z.email().max(200).toLowerCase().optional(),
  newPassword: z.string().min(8).max(50).optional(),
  firstname: z.string().nonempty().max(50).optional(),
  lastname: z.string().nonempty().max(50).optional(),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
  isEnabled: z.boolean().optional(),
}) satisfies z.ZodType<AdminUpdateUserProfileInput>;

export const AdminSetUserAdminIsAdminSchema = z.boolean();

const MergeSideSchema = z.enum(GqlAdminUserMergeSide).transform(side =>
  match(side)
    .with(GqlAdminUserMergeSide.Source, () => UserMergeSide.SOURCE)
    .with(GqlAdminUserMergeSide.Target, () => UserMergeSide.TARGET)
    .exhaustive(),
);

const MAX_MERGE_SELECTION = 500;

export const AdminMergeUsersInputSchema = z
  .object({
    sourceUserId: z.uuid().transform(val => val as UserId),
    targetUserId: z.uuid().transform(val => val as UserId),
    profile: z.object({
      email: MergeSideSchema,
      firstName: MergeSideSchema,
      lastName: MergeSideSchema,
      birthday: MergeSideSchema,
      picture: MergeSideSchema,
    }),
    accountIds: z.array(z.uuid().transform(val => val as UserAccountId)).max(MAX_MERGE_SELECTION),
    eventIds: z.array(z.uuid().transform(val => val as EventId)).max(MAX_MERGE_SELECTION),
    wishlistIds: z.array(z.uuid().transform(val => val as WishlistId)).max(MAX_MERGE_SELECTION),
    transferReservations: z.boolean(),
  })
  .refine(input => input.sourceUserId !== input.targetUserId, {
    path: ['targetUserId'],
    message: 'must be different from sourceUserId',
  });

export type AdminMergeUsersParsedInput = z.output<typeof AdminMergeUsersInputSchema>;
