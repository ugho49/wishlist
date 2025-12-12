import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { GqlUser } from '../../user/infrastructure/user.dto'
import { GqlEventAttendee } from './event.dto'

@Resolver(() => GqlEventAttendee)
export class EventAttendeeResolver {
  @ResolveField(() => GqlUser, { nullable: true })
  user(@Parent() parent: GqlEventAttendee, @Context() ctx: GraphQLContext): Promise<GqlUser | null> {
    if (!parent.userId) return Promise.resolve(null)
    return ctx.loaders.user.load(parent.userId)
  }
}
