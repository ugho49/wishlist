import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { UserFull, UserSocial } from '../../../gql/generated-types'

@Resolver('UserFull')
export class UserAdminFieldResolver {
  @ResolveField()
  socials(@Parent() user: UserFull, @Context() ctx: GraphQLContext): Promise<UserSocial[]> {
    return ctx.loaders.userSocialsByUser.load(user.id)
  }
}
