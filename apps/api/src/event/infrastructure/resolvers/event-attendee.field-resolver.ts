import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { type GraphQLContext } from '@wishlist/api/core'

import { type EventAttendee, type User } from '../../../gql/generated-types'

@Resolver('EventAttendee')
export class EventAttendeeFieldResolver {
  @ResolveField()
  user(@Parent() parent: EventAttendee, @Context() ctx: GraphQLContext): Promise<User | null> {
    if (!parent.userId) return Promise.resolve(null)
    return ctx.loaders.user.load(parent.userId)
  }
}
