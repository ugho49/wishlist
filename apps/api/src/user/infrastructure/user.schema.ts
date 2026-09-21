import { type UserAccountId, type UserId, type UserSessionId } from '@wishlist/common';
import { match } from 'ts-pattern';
import z from 'zod';

import {
  type ChangeUserPasswordInput,
  type ConfirmEmailChangeInput,
  SignupSource as GqlSignupSource,
  type LinkUserToGoogleInput,
  type RegisterUserInput,
  type RequestEmailChangeInput,
  type ResetPasswordInput,
  type RevokeSessionInput,
  type SendResetPasswordEmailInput,
  type SetSignupSourceInput,
  type UpdateUserEmailSettingsInput,
  type UpdateUserPictureFromAccountInput,
  type UpdateUserProfileInput,
} from '../../gql/generated-types';
import { SignupSource } from '../domain/signup-source.enum';

export const UserIdSchema = z.string().transform(val => val as UserId);

export const UserSessionIdSchema = z.string().transform(val => val as UserSessionId);

export const SearchUsersKeywordSchema = z.string().trim().min(2).max(100);

export const ClosestFriendsLimitSchema = z.number().int().min(1).max(50).optional();

export const UpdateUserProfileInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
}) satisfies z.ZodType<UpdateUserProfileInput>;

export const SetSignupSourceInputSchema = z
  .object({
    source: z.enum(GqlSignupSource),
    detail: z.string().nullish(),
  })
  .superRefine((value, ctx) => {
    if (value.source !== GqlSignupSource.Other) {
      return;
    }

    const detail = value.detail?.trim() ?? '';
    if (detail.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['detail'],
        message: 'required when source is OTHER',
      });
      return;
    }

    if (detail.length > 200) {
      ctx.addIssue({
        code: 'custom',
        path: ['detail'],
        message: '200 characters maximum',
      });
    }
  }) satisfies z.ZodType<SetSignupSourceInput>;

export function toDomainSignupSource(source: GqlSignupSource): SignupSource {
  return match(source)
    .with(GqlSignupSource.Google, () => SignupSource.GOOGLE)
    .with(GqlSignupSource.Friends, () => SignupSource.FRIENDS)
    .with(GqlSignupSource.Social, () => SignupSource.SOCIAL)
    .with(GqlSignupSource.Other, () => SignupSource.OTHER)
    .exhaustive();
}

export const RegisterUserInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(50),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
}) satisfies z.ZodType<RegisterUserInput>;

export const LinkUserToGoogleInputSchema = z.object({
  code: z.string(),
}) satisfies z.ZodType<LinkUserToGoogleInput>;

export const ChangeUserPasswordInputSchema = z.object({
  oldPassword: z.string().min(8).max(50),
  newPassword: z.string().min(8).max(50),
}) satisfies z.ZodType<ChangeUserPasswordInput>;

export const UpdateUserPictureFromAccountInputSchema = z.object({
  accountId: z.string().transform(val => val as UserAccountId),
}) satisfies z.ZodType<UpdateUserPictureFromAccountInput>;

export const RequestEmailChangeInputSchema = z.object({
  newEmail: z.email().max(200).toLowerCase(),
}) satisfies z.ZodType<RequestEmailChangeInput>;

export const ConfirmEmailChangeInputSchema = z.object({
  newEmail: z.email().toLowerCase(),
  token: z.string().nonempty(),
}) satisfies z.ZodType<ConfirmEmailChangeInput>;

export const UpdateUserEmailSettingsInputSchema = z.object({
  dailyNewItemNotification: z.boolean(),
  birthdayReminder: z.boolean(),
}) satisfies z.ZodType<UpdateUserEmailSettingsInput>;

export const SendResetPasswordEmailInputSchema = z.object({
  email: z.email().toLowerCase(),
}) satisfies z.ZodType<SendResetPasswordEmailInput>;

export const ResetPasswordInputSchema = z.object({
  email: z.email().toLowerCase(),
  token: z.string().nonempty(),
  newPassword: z.string().min(8).max(50),
}) satisfies z.ZodType<ResetPasswordInput>;

export const RevokeSessionInputSchema = z.object({
  sessionId: UserSessionIdSchema,
}) satisfies z.ZodType<RevokeSessionInput>;
