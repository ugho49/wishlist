import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'

import { User, UserSocial } from '../../../gql/generated-types'

@Resolver('User')
export class UserFieldResolver {
  @ResolveField()
  socials(
    @Parent() user: User,
    @Context() ctx: GraphQLContext,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<UserSocial[] | null> {
    if (user.id !== currentUserId) return Promise.resolve(null)
    return ctx.loaders.userSocialsByUser.load(user.id)
  }
}
