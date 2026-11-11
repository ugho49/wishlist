import type { ICurrentUser } from '@wishlist/common';

import { type UserAccountId, type UserId } from '@wishlist/common';
import { Args, Loader, Mutation, Query, Resolver } from '@znight/graphql';

import { Authenticated, Public } from '../../../auth/infrastructure/decorators/public.metadata';
import { CurrentUser, CurrentUserId } from '../../../auth/infrastructure/decorators/user.decorator';
import {
  type ChangeUserPasswordInput,
  type ChangeUserPasswordResult,
  type ClosestFriendsResult,
  type ConfirmEmailChangeInput,
  type ConfirmEmailChangeResult,
  type GetPendingEmailChangeResult,
  type LinkUserToGoogleInput,
  type LinkUserToGoogleResult,
  type PendingEmailChange,
  type RegisterUserInput,
  type RegisterUserResult,
  type RemoveUserPictureResult,
  type RequestEmailChangeInput,
  type RequestEmailChangeResult,
  type ResetPasswordInput,
  type ResetPasswordResult,
  type RevokeSessionInput,
  type RevokeSessionResult,
  type SearchUsersResult,
  type SendResetPasswordEmailInput,
  type SendResetPasswordEmailResult,
  type SetSignupSourceInput,
  type SetSignupSourceResult,
  type UnlinkCurrentUserAccountResult,
  type UpdateUserEmailSettingsInput,
  type UpdateUserEmailSettingsResult,
  type UpdateUserPictureFromAccountInput,
  type UpdateUserPictureFromAccountResult,
  type UpdateUserProfileInput,
  type UpdateUserProfileResult,
  type User,
} from '../../../gql/generated-types';
import { UsersById } from '../../../user/infrastructure/user.dataloader';
import { ConfirmEmailChangeUseCase } from '../../application/command/confirm-email-change.use-case';
import { CreateEmailChangeVerificationUseCase } from '../../application/command/create-email-change-verification.use-case';
import { CreatePasswordVerificationUseCase } from '../../application/command/create-password-verification.use-case';
import { CreateUserUseCase } from '../../application/command/create-user.use-case';
import { LinkUserToGoogleUseCase } from '../../application/command/link-user-to-google.use-case';
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case';
import { ResetUserPasswordUseCase } from '../../application/command/reset-user-password.use-case';
import { RevokeUserSessionUseCase } from '../../application/command/revoke-user-session.use-case';
import { SetSignupSourceUseCase } from '../../application/command/set-signup-source.use-case';
import { UnlinkUserAccountUseCase } from '../../application/command/unlink-user-account.use-case';
import { UpdateUserUseCase } from '../../application/command/update-user.use-case';
import { UpdateUserEmailSettingUseCase } from '../../application/command/update-user-email-setting.use-case';
import { UpdateUserPasswordUseCase } from '../../application/command/update-user-password.use-case';
import { UpdateUserPictureFromAccountUseCase } from '../../application/command/update-user-picture-from-account.use-case';
import { GetClosestFriendsUseCase } from '../../application/query/get-closest-friends.use-case';
import { GetPendingEmailChangeUseCase } from '../../application/query/get-pending-email-change.use-case';
import { GetUsersByCriteriaUseCase } from '../../application/query/get-users-by-criteria.use-case';
import { SignupSource } from '../../domain/signup-source.enum';
import { userMapper } from '../user.mapper';
import {
  ChangeUserPasswordInputSchema,
  ClosestFriendsLimitSchema,
  ConfirmEmailChangeInputSchema,
  LinkUserToGoogleInputSchema,
  RegisterUserInputSchema,
  RequestEmailChangeInputSchema,
  ResetPasswordInputSchema,
  RevokeSessionInputSchema,
  SearchUsersKeywordSchema,
  SendResetPasswordEmailInputSchema,
  SetSignupSourceInputSchema,
  toDomainSignupSource,
  UpdateUserEmailSettingsInputSchema,
  UpdateUserPictureFromAccountInputSchema,
  UpdateUserProfileInputSchema,
} from '../user.schema';

@Resolver()
@Authenticated()
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly unlinkUserAccountUseCase: UnlinkUserAccountUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly setSignupSourceUseCase: SetSignupSourceUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private readonly updateUserPictureFromAccountUseCase: UpdateUserPictureFromAccountUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
    private readonly createEmailChangeVerificationUseCase: CreateEmailChangeVerificationUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
    private readonly getPendingEmailChangeUseCase: GetPendingEmailChangeUseCase,
    private readonly updateUserEmailSettingUseCase: UpdateUserEmailSettingUseCase,
    private readonly createPasswordVerificationUseCase: CreatePasswordVerificationUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
    private readonly revokeUserSessionUseCase: RevokeUserSessionUseCase,
    private readonly getUsersByCriteriaUseCase: GetUsersByCriteriaUseCase,
    private readonly getClosestFriendsUseCase: GetClosestFriendsUseCase,
  ) {}
  @Query()
  async currentUser(@CurrentUserId() currentUserId: UserId, @Loader() usersLoader: Loader<UsersById>): Promise<User> {
    const user = await usersLoader.load(currentUserId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Query()
  async searchUsers(
    @Args('keyword', SearchUsersKeywordSchema) keyword: string,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<SearchUsersResult> {
    const { users } = await this.getUsersByCriteriaUseCase.execute({ currentUser, criteria: keyword });

    return {
      __typename: 'SearchUsersOutput',
      users: users.map(user => userMapper.toGqlUser(user)),
    };
  }

  @Query()
  async closestFriends(
    @Args('limit', ClosestFriendsLimitSchema) limit: number | undefined,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<ClosestFriendsResult> {
    const { users } = await this.getClosestFriendsUseCase.execute({ userId: currentUserId, limit: limit ?? 20 });

    return {
      __typename: 'ClosestFriendsOutput',
      users: users.map(user => userMapper.toGqlUser(user)),
    };
  }

  @Public()
  @Mutation()
  async registerUser(@Args('input', RegisterUserInputSchema) input: RegisterUserInput): Promise<RegisterUserResult> {
    const { user } = await this.createUserUseCase.execute({
      newUser: {
        email: input.email,
        password: input.password,
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    });

    return userMapper.toGqlUser(user);
  }

  @Mutation()
  async linkCurrentUserWithGoogle(
    @Args('input', LinkUserToGoogleInputSchema) input: LinkUserToGoogleInput,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<LinkUserToGoogleResult> {
    const { userAccount } = await this.linkUserToGoogleUseCase.execute({
      code: input.code,
      userId: currentUserId,
    });

    return userMapper.toGqlUserAccount(userAccount);
  }

  @Mutation()
  async unlinkCurrentUserAccount(
    @Args('accountId') id: UserAccountId,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<UnlinkCurrentUserAccountResult> {
    await this.unlinkUserAccountUseCase.execute({ userId: currentUserId, accountId: id });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async updateUserProfile(
    @Args('input', UpdateUserProfileInputSchema) input: UpdateUserProfileInput,
    @CurrentUserId() currentUserId: UserId,
    @Loader() usersLoader: Loader<UsersById>,
  ): Promise<UpdateUserProfileResult> {
    await this.updateUserUseCase.execute({
      userId: currentUserId,
      updateUser: {
        firstname: input.firstname,
        lastname: input.lastname,
        birthday: input.birthday ? new Date(input.birthday) : undefined,
      },
    });

    const loadedUser = await usersLoader.load(currentUserId);
    if (!loadedUser) {
      throw new Error('Failed to load user');
    }
    return loadedUser;
  }

  @Mutation()
  async setSignupSource(
    @Args('input', SetSignupSourceInputSchema) input: SetSignupSourceInput,
    @CurrentUserId() currentUserId: UserId,
    @Loader() usersLoader: Loader<UsersById>,
  ): Promise<SetSignupSourceResult> {
    const source = toDomainSignupSource(input.source);
    await this.setSignupSourceUseCase.execute({
      userId: currentUserId,
      source,
      detail: source === SignupSource.OTHER ? input.detail?.trim() : undefined,
    });

    const loadedUser = await usersLoader.load(currentUserId);
    if (!loadedUser) {
      throw new Error('Failed to load user');
    }
    return loadedUser;
  }

  @Mutation()
  async changeUserPassword(
    @Args('input', ChangeUserPasswordInputSchema) input: ChangeUserPasswordInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<ChangeUserPasswordResult> {
    await this.updateUserPasswordUseCase.execute({
      currentUser,
      oldPassword: input.oldPassword,
      newPassword: input.newPassword,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async updateUserPictureFromAccount(
    @Args('input', UpdateUserPictureFromAccountInputSchema) input: UpdateUserPictureFromAccountInput,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<UpdateUserPictureFromAccountResult> {
    await this.updateUserPictureFromAccountUseCase.execute({
      userId: currentUserId,
      accountId: input.accountId,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async removeUserPicture(@CurrentUserId() currentUserId: UserId): Promise<RemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId: currentUserId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Query()
  async pendingEmailChange(@CurrentUser() currentUser: ICurrentUser): Promise<GetPendingEmailChangeResult | null> {
    const result = await this.getPendingEmailChangeUseCase.execute({ currentUser });

    if (!result) {
      return null;
    }

    const pendingEmailChange: PendingEmailChange = {
      __typename: 'PendingEmailChange',
      newEmail: result.newEmail,
      expiredAt: result.expiredAt,
    };

    return pendingEmailChange;
  }

  @Mutation()
  async requestEmailChange(
    @Args('input', RequestEmailChangeInputSchema) input: RequestEmailChangeInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<RequestEmailChangeResult> {
    await this.createEmailChangeVerificationUseCase.execute({
      currentUser,
      newEmail: input.newEmail,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Public()
  @Mutation()
  async confirmEmailChange(
    @Args('input', ConfirmEmailChangeInputSchema) input: ConfirmEmailChangeInput,
  ): Promise<ConfirmEmailChangeResult> {
    await this.confirmEmailChangeUseCase.execute({
      newEmail: input.newEmail,
      token: input.token,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async updateUserEmailSettings(
    @Args('input', UpdateUserEmailSettingsInputSchema) input: UpdateUserEmailSettingsInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateUserEmailSettingsResult> {
    const { userEmailSetting } = await this.updateUserEmailSettingUseCase.execute({
      currentUser,
      dailyNewItemNotification: input.dailyNewItemNotification,
      birthdayReminder: input.birthdayReminder,
    });

    return userMapper.toGqlUserEmailSettings(userEmailSetting);
  }

  @Public()
  @Mutation()
  async sendResetPasswordEmail(
    @Args('input', SendResetPasswordEmailInputSchema) input: SendResetPasswordEmailInput,
  ): Promise<SendResetPasswordEmailResult> {
    await this.createPasswordVerificationUseCase.execute({ email: input.email });
    return { __typename: 'VoidOutput', success: true };
  }

  @Public()
  @Mutation()
  async resetPassword(
    @Args('input', ResetPasswordInputSchema) input: ResetPasswordInput,
  ): Promise<ResetPasswordResult> {
    await this.resetUserPasswordUseCase.execute({
      email: input.email,
      token: input.token,
      newPassword: input.newPassword,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async revokeSession(
    @Args('input', RevokeSessionInputSchema) input: RevokeSessionInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<RevokeSessionResult> {
    await this.revokeUserSessionUseCase.execute({
      currentUser,
      sessionId: input.sessionId,
    });
    return { __typename: 'VoidOutput', success: true };
  }
}
