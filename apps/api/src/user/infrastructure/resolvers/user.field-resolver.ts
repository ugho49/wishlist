import type { ICurrentUser } from '@wishlist/common'

import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'

import { User, UserEmailSettings, UserSocial } from '../../../gql/generated-types'
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case'

@Resolver('User')
export class UserFieldResolver {
  constructor(private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase) {}

  @ResolveField()
  socials(
    @Parent() user: User,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserSocial[] | null> {
    if (user.id !== currentUserId) return Promise.resolve(null)
    return ctx.loaders.userSocialsByUser.load(user.id)
  }

  @ResolveField()
  async emailSettings(
    @Parent() user: User,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<UserEmailSettings | null> {
    if (user.id !== currentUser.id) return null

    const result = await this.getUserEmailSettingUseCase.execute({ currentUser })

    return {
      __typename: 'UserEmailSettings',
      dailyNewItemNotification: result.daily_new_item_notification,
    }
  }
}
