import type { ICurrentUser } from '@wishlist/common';

import { Inject } from '@nestjs/common';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type UserId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import {
  type User,
  type UserAccount,
  UserAccountProvider,
  type UserEmailSettings,
  type UserGiftProfile,
  type UserSession,
} from '../../../gql/generated-types';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case';
import { type UserRepository } from '../../domain/repository/user.repository';
import { userMapper } from '../user.mapper';

@Resolver('User')
export class UserFieldResolver {
  constructor(
    private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

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

  @ResolveField()
  async giftProfile(
    @Parent() user: User,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserGiftProfile | null> {
    if (user.id !== currentUserId) return null;

    const current = await this.userRepository.findByIdOrFail(currentUserId);
    return userMapper.toGqlUserGiftProfile(current.getGiftProfile());
  }
}
