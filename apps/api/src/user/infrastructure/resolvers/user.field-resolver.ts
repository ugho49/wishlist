import type { ICurrentUser } from '@wishlist/common';

import { type UserId } from '@wishlist/common';
import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';

import { CurrentUser, CurrentUserId } from '../../../auth/infrastructure/decorators/user.decorator';
import {
  type User,
  type UserAccount,
  UserAccountProvider,
  type UserEmailSettings,
  type UserSession,
} from '../../../gql/generated-types';
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case';
import { UserAccountsByUserId, UserSessionsByUserId } from '../user.dataloader';
import { userMapper } from '../user.mapper';

@Resolver('User')
export class UserFieldResolver {
  constructor(private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase) {}

  @ResolveField()
  async accounts(
    @Parent() user: User,
    @CurrentUserId() currentUserId: UserId,
    @Loader() userAccountsLoader: Loader<UserAccountsByUserId>,
  ): Promise<UserAccount[] | null> {
    if (user.id !== currentUserId) return null;

    const accounts = await userAccountsLoader.load(user.id);
    return accounts.filter(account => account.provider !== UserAccountProvider.Password);
  }

  @ResolveField()
  async sessions(
    @Parent() user: User,
    @CurrentUserId() currentUserId: UserId,
    @Loader() userSessionsLoader: Loader<UserSessionsByUserId>,
  ): Promise<UserSession[] | null> {
    if (user.id !== currentUserId) return null;

    return await userSessionsLoader.load(user.id);
  }

  @ResolveField()
  async emailSettings(
    @Parent() user: User,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<UserEmailSettings | null> {
    if (user.id !== currentUser.id) return null;

    const { userEmailSetting } = await this.getUserEmailSettingUseCase.execute({ currentUser });

    return userMapper.toGqlUserEmailSettings(userEmailSetting);
  }
}
