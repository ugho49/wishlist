import type { ICurrentUser } from '@wishlist/common';

import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type UserId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import {
  type User,
  type UserAccount,
  UserAccountProvider,
  type UserEmailSettings,
  type UserSession,
} from '../../../gql/generated-types';
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case';
import { userMapper } from '../user.mapper';

@Resolver('User')
export class UserFieldResolver {
  constructor(private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase) {}

  @ResolveField()
  async accounts(
    @Parent() user: User,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserAccount[] | null> {
    if (user.id !== currentUserId) return null;

    const accounts = await ctx.loaders.userAccountsByUser.load(user.id);
    return accounts.filter(account => account.provider !== UserAccountProvider.Password);
  }

  @ResolveField()
  async sessions(
    @Parent() user: User,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserSession[] | null> {
    if (user.id !== currentUserId) return null;

    return await ctx.loaders.userSessionsByUser.load(user.id);
  }

  @ResolveField()
  async emailSettings(
    @Parent() user: User,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UserEmailSettings | null> {
    if (user.id !== currentUser.id) return null;

    const { userEmailSetting } = await this.getUserEmailSettingUseCase.execute({ currentUser });

    return userMapper.toGqlUserEmailSettings(userEmailSetting);
  }
}
