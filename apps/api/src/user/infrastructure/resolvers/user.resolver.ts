import type { ICurrentUser } from '@wishlist/common'

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, Public } from '@wishlist/api/auth'
import { GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { UserId, UserSocialId } from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import {
  ChangeUserPasswordInput,
  ChangeUserPasswordResult,
  ConfirmEmailChangeInput,
  ConfirmEmailChangeResult,
  GetPendingEmailChangeResult,
  GetUserEmailSettingsResult,
  LinkUserToGoogleInput,
  LinkUserToGoogleResult,
  PendingEmailChange,
  RegisterUserInput,
  RegisterUserResult,
  RemoveUserPictureResult,
  RequestEmailChangeInput,
  RequestEmailChangeResult,
  ResetPasswordInput,
  ResetPasswordResult,
  SendResetPasswordEmailInput,
  SendResetPasswordEmailResult,
  UnlinkCurrentUserSocialResult,
  UpdateUserEmailSettingsInput,
  UpdateUserEmailSettingsResult,
  UpdateUserPictureFromSocialInput,
  UpdateUserPictureFromSocialResult,
  UpdateUserProfileInput,
  UpdateUserProfileResult,
  User,
  UserEmailSettings,
} from '../../../gql/generated-types'
import { ConfirmEmailChangeUseCase } from '../../application/command/confirm-email-change.use-case'
import { CreateEmailChangeVerificationUseCase } from '../../application/command/create-email-change-verification.use-case'
import { CreatePasswordVerificationUseCase } from '../../application/command/create-password-verification.use-case'
import { CreateUserUseCase } from '../../application/command/create-user.use-case'
import { LinkUserToGoogleUseCase } from '../../application/command/link-user-to-google.use-case'
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case'
import { ResetUserPasswordUseCase } from '../../application/command/reset-user-password.use-case'
import { UnlinkUserSocialUseCase } from '../../application/command/unlink-user-social.use-case'
import { UpdateUserUseCase } from '../../application/command/update-user.use-case'
import { UpdateUserEmailSettingUseCase } from '../../application/command/update-user-email-setting.use-case'
import { UpdateUserPasswordUseCase } from '../../application/command/update-user-password.use-case'
import { UpdateUserPictureFromSocialUseCase } from '../../application/command/update-user-picture-from-social.use-case'
import { GetPendingEmailChangeUseCase } from '../../application/query/get-pending-email-change.use-case'
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case'
import {
  ChangeUserPasswordInputSchema,
  ConfirmEmailChangeInputSchema,
  LinkUserToGoogleInputSchema,
  RegisterUserInputSchema,
  RequestEmailChangeInputSchema,
  ResetPasswordInputSchema,
  SendResetPasswordEmailInputSchema,
  UpdateUserEmailSettingsInputSchema,
  UpdateUserPictureFromSocialInputSchema,
  UpdateUserProfileInputSchema,
} from '../user.schema'

@Resolver()
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly unlinkUserSocialUseCase: UnlinkUserSocialUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private readonly updateUserPictureFromSocialUseCase: UpdateUserPictureFromSocialUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
    private readonly createEmailChangeVerificationUseCase: CreateEmailChangeVerificationUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
    private readonly getPendingEmailChangeUseCase: GetPendingEmailChangeUseCase,
    private readonly updateUserEmailSettingUseCase: UpdateUserEmailSettingUseCase,
    private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase,
    private readonly createPasswordVerificationUseCase: CreatePasswordVerificationUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
  ) {}

  @Query()
  async getCurrentUser(@GqlCurrentUser('id') currentUserId: UserId, @Context() ctx: GraphQLContext): Promise<User> {
    const user = await ctx.loaders.user.load(currentUserId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  @Public()
  @Mutation()
  async registerUser(
    @Args('input', new ZodPipe(RegisterUserInputSchema)) input: RegisterUserInput,
    @RealIP() ip: string,
    @Context() ctx: GraphQLContext,
  ): Promise<RegisterUserResult> {
    const user = await this.createUserUseCase.execute({
      ip,
      newUser: {
        email: input.email,
        password: input.password,
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    })

    const loadedUser = await ctx.loaders.user.load(user.id)

    if (!loadedUser) {
      throw new Error('Failed to load user')
    }

    return loadedUser
  }

  @Mutation()
  async linkCurrentUserlWithGoogle(
    @Args('input', new ZodPipe(LinkUserToGoogleInputSchema)) input: LinkUserToGoogleInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<LinkUserToGoogleResult> {
    const userSocial = await this.linkUserToGoogleUseCase.execute({
      code: input.code,
      userId: currentUserId,
    })

    const loadedUserSocial = await ctx.loaders.userSocial.load(userSocial.id)
    if (!loadedUserSocial) {
      throw new Error('Failed to load user social')
    }
    return loadedUserSocial
  }

  @Mutation()
  async unlinkCurrentUserSocial(
    @Args('socialId', { type: () => String }) id: UserSocialId,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UnlinkCurrentUserSocialResult> {
    await this.unlinkUserSocialUseCase.execute({ userId: currentUserId, socialId: id })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async updateUserProfile(
    @Args('input', new ZodPipe(UpdateUserProfileInputSchema)) input: UpdateUserProfileInput,
    @GqlCurrentUser('id') currentUserId: UserId,
    @Context() ctx: GraphQLContext,
  ): Promise<UpdateUserProfileResult> {
    await this.updateUserUseCase.execute({
      userId: currentUserId,
      updateUser: {
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    })

    const loadedUser = await ctx.loaders.user.load(currentUserId)
    if (!loadedUser) {
      throw new Error('Failed to load user')
    }
    return loadedUser
  }

  @Mutation()
  async changeUserPassword(
    @Args('input', new ZodPipe(ChangeUserPasswordInputSchema)) input: ChangeUserPasswordInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<ChangeUserPasswordResult> {
    await this.updateUserPasswordUseCase.execute({
      userId: currentUserId,
      oldPassword: input.oldPassword,
      newPassword: input.newPassword,
    })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async updateUserPictureFromSocial(
    @Args('input', new ZodPipe(UpdateUserPictureFromSocialInputSchema)) input: UpdateUserPictureFromSocialInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UpdateUserPictureFromSocialResult> {
    await this.updateUserPictureFromSocialUseCase.execute({
      userId: currentUserId,
      socialId: input.socialId,
    })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async removeUserPicture(@GqlCurrentUser('id') currentUserId: UserId): Promise<RemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId: currentUserId })
    return { __typename: 'VoidOutput', success: true }
  }

  @Query()
  async getPendingEmailChange(
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GetPendingEmailChangeResult | null> {
    const result = await this.getPendingEmailChangeUseCase.execute({ currentUser })

    if (!result) {
      return null
    }

    const pendingEmailChange: PendingEmailChange = {
      __typename: 'PendingEmailChange',
      newEmail: result.newEmail,
      expiredAt: result.expiredAt,
    }

    return pendingEmailChange
  }

  @Mutation()
  async requestEmailChange(
    @Args('input', new ZodPipe(RequestEmailChangeInputSchema)) input: RequestEmailChangeInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<RequestEmailChangeResult> {
    await this.createEmailChangeVerificationUseCase.execute({
      currentUser,
      newEmail: input.newEmail,
    })
    return { __typename: 'VoidOutput', success: true }
  }

  @Public()
  @Mutation()
  async confirmEmailChange(
    @Args('input', new ZodPipe(ConfirmEmailChangeInputSchema)) input: ConfirmEmailChangeInput,
  ): Promise<ConfirmEmailChangeResult> {
    await this.confirmEmailChangeUseCase.execute({
      newEmail: input.newEmail,
      token: input.token,
    })
    return { __typename: 'VoidOutput', success: true }
  }

  @Query()
  async getUserEmailSettings(@GqlCurrentUser() currentUser: ICurrentUser): Promise<GetUserEmailSettingsResult> {
    const result = await this.getUserEmailSettingUseCase.execute({ currentUser })

    const settings: UserEmailSettings = {
      __typename: 'UserEmailSettings',
      dailyNewItemNotification: result.daily_new_item_notification,
    }

    return settings
  }

  @Mutation()
  async updateUserEmailSettings(
    @Args('input', new ZodPipe(UpdateUserEmailSettingsInputSchema)) input: UpdateUserEmailSettingsInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateUserEmailSettingsResult> {
    const result = await this.updateUserEmailSettingUseCase.execute({
      currentUser,
      dailyNewItemNotification: input.dailyNewItemNotification,
    })

    const settings: UserEmailSettings = {
      __typename: 'UserEmailSettings',
      dailyNewItemNotification: result.daily_new_item_notification,
    }

    return settings
  }

  @Public()
  @Mutation()
  async sendResetPasswordEmail(
    @Args('input', new ZodPipe(SendResetPasswordEmailInputSchema)) input: SendResetPasswordEmailInput,
  ): Promise<SendResetPasswordEmailResult> {
    await this.createPasswordVerificationUseCase.execute({ email: input.email })
    return { __typename: 'VoidOutput', success: true }
  }

  @Public()
  @Mutation()
  async resetPassword(
    @Args('input', new ZodPipe(ResetPasswordInputSchema)) input: ResetPasswordInput,
  ): Promise<ResetPasswordResult> {
    await this.resetUserPasswordUseCase.execute({
      email: input.email,
      token: input.token,
      newPassword: input.newPassword,
    })
    return { __typename: 'VoidOutput', success: true }
  }
}
