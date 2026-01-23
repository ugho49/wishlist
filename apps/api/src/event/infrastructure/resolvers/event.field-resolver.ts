import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLContext } from '@wishlist/api/core'

import { Event, EventAttendee, Wishlist } from '../../../gql/generated-types'

@Resolver('Event')
export class EventFieldResolver {
  @ResolveField()
  async wishlists(@Parent() event: Event, @Context() ctx: GraphQLContext): Promise<Wishlist[]> {
    if (event.wishlistIds.length === 0) return []
    const wishlists = await ctx.loaders.wishlist.loadMany(event.wishlistIds)
    return wishlists.filter((wishlist): wishlist is Wishlist => wishlist !== null)
  }

  @ResolveField()
  async attendees(@Parent() event: Event, @Context() ctx: GraphQLContext): Promise<EventAttendee[]> {
    if (event.attendeeIds.length === 0) return []
    const attendees = await ctx.loaders.eventAttendee.loadMany(event.attendeeIds)
    return attendees.filter((attendee): attendee is EventAttendee => attendee !== null)
  }
}
