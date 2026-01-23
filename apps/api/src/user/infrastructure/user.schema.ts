import type {
  ChangeUserPasswordInput,
  ConfirmEmailChangeInput,
  LinkUserToGoogleInput,
  RegisterUserInput,
  RequestEmailChangeInput,
  ResetPasswordInput,
  SendResetPasswordEmailInput,
  UpdateUserEmailSettingsInput,
  UpdateUserPictureFromSocialInput,
  UpdateUserProfileInput,
} from '../../gql/generated-types'

import { UserId, UserSocialId } from '@wishlist/common'
import z from 'zod'

export const UserIdSchema = z.string().transform(val => val as UserId)

export const UpdateUserProfileInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
}) satisfies z.ZodType<UpdateUserProfileInput>

export const RegisterUserInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(50),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
}) satisfies z.ZodType<RegisterUserInput>

export const LinkUserToGoogleInputSchema = z.object({
  code: z.string(),
}) satisfies z.ZodType<LinkUserToGoogleInput>

export const ChangeUserPasswordInputSchema = z.object({
  oldPassword: z.string().min(8).max(50),
  newPassword: z.string().min(8).max(50),
}) satisfies z.ZodType<ChangeUserPasswordInput>

export const UpdateUserPictureFromSocialInputSchema = z.object({
  socialId: z.string().transform(val => val as UserSocialId),
}) satisfies z.ZodType<UpdateUserPictureFromSocialInput>

export const RequestEmailChangeInputSchema = z.object({
  newEmail: z.email().max(200).toLowerCase(),
}) satisfies z.ZodType<RequestEmailChangeInput>

export const ConfirmEmailChangeInputSchema = z.object({
  newEmail: z.email().toLowerCase(),
  token: z.string().nonempty(),
}) satisfies z.ZodType<ConfirmEmailChangeInput>

export const UpdateUserEmailSettingsInputSchema = z.object({
  dailyNewItemNotification: z.boolean(),
}) satisfies z.ZodType<UpdateUserEmailSettingsInput>

export const SendResetPasswordEmailInputSchema = z.object({
  email: z.email().toLowerCase(),
}) satisfies z.ZodType<SendResetPasswordEmailInput>

export const ResetPasswordInputSchema = z.object({
  email: z.email().toLowerCase(),
  token: z.string().nonempty(),
  newPassword: z.string().min(8).max(50),
}) satisfies z.ZodType<ResetPasswordInput>
