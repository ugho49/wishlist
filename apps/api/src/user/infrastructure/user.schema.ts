import { UserSocialId } from '@wishlist/common'
import z from 'zod'

import {
  ChangeUserPasswordInput,
  LinkUserToGoogleInput,
  RegisterUserInput,
  UpdateUserPictureFromSocialInput,
  UpdateUserProfileInput,
} from '../../gql/generated-types'

export const UpdateUserProfileInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  birthday: z.iso.date({ message: 'must be in format YYYY-MM-DD' }).optional(),
}) satisfies z.ZodType<UpdateUserProfileInput>

export const RegisterUserInputSchema = z.object({
  firstname: z.string().nonempty().max(50),
  lastname: z.string().nonempty().max(50),
  email: z.email().transform(value => value.toLowerCase()),
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
