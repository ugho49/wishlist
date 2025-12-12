import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext } from '@wishlist/api/core'
import { UserId } from '@wishlist/common'

import { GqlUser, GqlUserSocial } from './user.dto'

@Resolver(() => GqlUser)
export class UserResolver {
  @Query(() => GqlUser)
  async getCurrentUser(@GqlCurrentUser('id') currentUserId: UserId, @Context() ctx: GraphQLContext): Promise<GqlUser> {
    const user = await ctx.loaders.user.load(currentUserId)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }

  @ResolveField(() => [GqlUserSocial])
  socials(@Parent() user: GqlUser, @Context() ctx: GraphQLContext): Promise<GqlUserSocial[]> {
    return ctx.loaders.userSocial.load(user.id)
  }
}
