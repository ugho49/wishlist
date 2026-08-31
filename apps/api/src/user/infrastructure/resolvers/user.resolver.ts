import type { ICurrentUser } from '@wishlist/common';

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { type UserAccountId, type UserId } from '@wishlist/common';

import { Public } from '../../../auth/infrastructure/decorators/public.metadata';
import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
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
  type RevokeAllOtherSessionsResult,
  type RevokeSessionInput,
  type RevokeSessionResult,
  type SearchUsersResult,
  type SendResetPasswordEmailInput,
  type SendResetPasswordEmailResult,
  type UnlinkCurrentUserAccountResult,
  type UpdateUserEmailSettingsInput,
  type UpdateUserEmailSettingsResult,
  type UpdateUserPictureFromAccountInput,
  type UpdateUserPictureFromAccountResult,
  type UpdateUserProfileInput,
  type UpdateUserProfileResult,
  type User,
} from '../../../gql/generated-types';
import { ConfirmEmailChangeUseCase } from '../../application/command/confirm-email-change.use-case';
import { CreateEmailChangeVerificationUseCase } from '../../application/command/create-email-change-verification.use-case';
import { CreatePasswordVerificationUseCase } from '../../application/command/create-password-verification.use-case';
import { CreateUserUseCase } from '../../application/command/create-user.use-case';
import { LinkUserToGoogleUseCase } from '../../application/command/link-user-to-google.use-case';
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case';
import { ResetUserPasswordUseCase } from '../../application/command/reset-user-password.use-case';
import { RevokeAllOtherUserSessionsUseCase } from '../../application/command/revoke-all-other-user-sessions.use-case';
import { RevokeUserSessionUseCase } from '../../application/command/revoke-user-session.use-case';
import { UnlinkUserAccountUseCase } from '../../application/command/unlink-user-account.use-case';
import { UpdateUserUseCase } from '../../application/command/update-user.use-case';
import { UpdateUserEmailSettingUseCase } from '../../application/command/update-user-email-setting.use-case';
import { UpdateUserPasswordUseCase } from '../../application/command/update-user-password.use-case';
import { UpdateUserPictureFromAccountUseCase } from '../../application/command/update-user-picture-from-account.use-case';
import { GetClosestFriendsUseCase } from '../../application/query/get-closest-friends.use-case';
import { GetPendingEmailChangeUseCase } from '../../application/query/get-pending-email-change.use-case';
import { GetUsersByCriteriaUseCase } from '../../application/query/get-users-by-criteria.use-case';
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
  UpdateUserEmailSettingsInputSchema,
  UpdateUserPictureFromAccountInputSchema,
  UpdateUserProfileInputSchema,
} from '../user.schema';

@Resolver()
export class UserResolver {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly unlinkUserAccountUseCase: UnlinkUserAccountUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
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
    private readonly revokeAllOtherUserSessionsUseCase: RevokeAllOtherUserSessionsUseCase,
    private readonly getUsersByCriteriaUseCase: GetUsersByCriteriaUseCase,
    private readonly getClosestFriendsUseCase: GetClosestFriendsUseCase,
  ) {}

  @Query()
  async currentUser(@GqlCurrentUser('id') currentUserId: UserId, @Context() ctx: GraphQLContext): Promise<User> {
    const user = await ctx.loaders.user.load(currentUserId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Query()
  async searchUsers(
    @Args('keyword', new ZodPipe(SearchUsersKeywordSchema)) keyword: string,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<SearchUsersResult> {
    const { users } = await this.getUsersByCriteriaUseCase.execute({ currentUser, criteria: keyword });

    return {
      __typename: 'SearchUsersOutput',
      users: users.map(user => userMapper.toGqlUser(user)),
    };
  }

  @Query()
  async closestFriends(
    @Args('limit', new ZodPipe(ClosestFriendsLimitSchema)) limit: number | undefined,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<ClosestFriendsResult> {
    const { users } = await this.getClosestFriendsUseCase.execute({ userId: currentUserId, limit: limit ?? 20 });

    return {
      __typename: 'ClosestFriendsOutput',
      users: users.map(user => userMapper.toGqlUser(user)),
    };
  }

  @Public()
  @Mutation()
  async registerUser(
    @Args('input', new ZodPipe(RegisterUserInputSchema)) input: RegisterUserInput,
  ): Promise<RegisterUserResult> {
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
    @Args('input', new ZodPipe(LinkUserToGoogleInputSchema)) input: LinkUserToGoogleInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<LinkUserToGoogleResult> {
    const { userAccount } = await this.linkUserToGoogleUseCase.execute({
      code: input.code,
      userId: currentUserId,
    });

    return userMapper.toGqlUserAccount(userAccount);
  }

  @Mutation()
  async unlinkCurrentUserAccount(
    @Args('accountId', { type: () => String }) id: UserAccountId,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UnlinkCurrentUserAccountResult> {
    await this.unlinkUserAccountUseCase.execute({ userId: currentUserId, accountId: id });
    return { __typename: 'VoidOutput', success: true };
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
    });

    const loadedUser = await ctx.loaders.user.load(currentUserId);
    if (!loadedUser) {
      throw new Error('Failed to load user');
    }
    return loadedUser;
  }

  @Mutation()
  async changeUserPassword(
    @Args('input', new ZodPipe(ChangeUserPasswordInputSchema)) input: ChangeUserPasswordInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
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
    @Args('input', new ZodPipe(UpdateUserPictureFromAccountInputSchema)) input: UpdateUserPictureFromAccountInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UpdateUserPictureFromAccountResult> {
    await this.updateUserPictureFromAccountUseCase.execute({
      userId: currentUserId,
      accountId: input.accountId,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async removeUserPicture(@GqlCurrentUser('id') currentUserId: UserId): Promise<RemoveUserPictureResult> {
    await this.removeUserPictureUseCase.execute({ userId: currentUserId });
    return { __typename: 'VoidOutput', success: true };
  }

  @Query()
  async pendingEmailChange(@GqlCurrentUser() currentUser: ICurrentUser): Promise<GetPendingEmailChangeResult | null> {
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
    @Args('input', new ZodPipe(RequestEmailChangeInputSchema)) input: RequestEmailChangeInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
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
    @Args('input', new ZodPipe(ConfirmEmailChangeInputSchema)) input: ConfirmEmailChangeInput,
  ): Promise<ConfirmEmailChangeResult> {
    await this.confirmEmailChangeUseCase.execute({
      newEmail: input.newEmail,
      token: input.token,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async updateUserEmailSettings(
    @Args('input', new ZodPipe(UpdateUserEmailSettingsInputSchema)) input: UpdateUserEmailSettingsInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UpdateUserEmailSettingsResult> {
    const { userEmailSetting } = await this.updateUserEmailSettingUseCase.execute({
      currentUser,
      dailyNewItemNotification: input.dailyNewItemNotification,
    });

    return userMapper.toGqlUserEmailSettings(userEmailSetting);
  }

  @Public()
  @Mutation()
  async sendResetPasswordEmail(
    @Args('input', new ZodPipe(SendResetPasswordEmailInputSchema)) input: SendResetPasswordEmailInput,
  ): Promise<SendResetPasswordEmailResult> {
    await this.createPasswordVerificationUseCase.execute({ email: input.email });
    return { __typename: 'VoidOutput', success: true };
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
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async revokeSession(
    @Args('input', new ZodPipe(RevokeSessionInputSchema)) input: RevokeSessionInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<RevokeSessionResult> {
    await this.revokeUserSessionUseCase.execute({
      currentUser,
      sessionId: input.sessionId,
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async revokeAllOtherSessions(@GqlCurrentUser() currentUser: ICurrentUser): Promise<RevokeAllOtherSessionsResult> {
    await this.revokeAllOtherUserSessionsUseCase.execute({ currentUser });
    return { __typename: 'VoidOutput', success: true };
  }
}
