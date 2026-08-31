import type { ICurrentUser } from '@wishlist/common';

import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type Event, type EventAttendee, type Wishlist } from '../../../gql/generated-types';

@Resolver('Event')
export class EventFieldResolver {
  @ResolveField()
  async wishlists(
    @Parent() event: Event,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<Wishlist[]> {
    if (event.wishlistIds.length === 0) return [];
    const wishlists = await ctx.loaders.getWishlistDataLoader(currentUser).loadMany(event.wishlistIds);
    return wishlists.filter((wishlist): wishlist is Wishlist => wishlist !== null);
  }

  @ResolveField()
  async attendees(@Parent() event: Event, @Context() ctx: GraphQLContext): Promise<EventAttendee[]> {
    if (event.attendeeIds.length === 0) return [];
    const attendees = await ctx.loaders.eventAttendee.loadMany(event.attendeeIds);
    return attendees.filter((attendee): attendee is EventAttendee => attendee !== null);
  }
}
