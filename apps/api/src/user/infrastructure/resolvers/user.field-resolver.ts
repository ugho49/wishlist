import type { ICurrentUser } from '@wishlist/common';

import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type UserId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type User, type UserEmailSettings, type UserSocial } from '../../../gql/generated-types';
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case';
import { userMapper } from '../user.mapper';

@Resolver('User')
export class UserFieldResolver {
  constructor(private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase) {}

  @ResolveField()
  socials(
    @Parent() user: User,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserSocial[] | null> {
    if (user.id !== currentUserId) return Promise.resolve(null);
    return ctx.loaders.userSocialsByUser.load(user.id);
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
