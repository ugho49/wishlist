import { QueryBus } from '@nestjs/cqrs'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext } from '@wishlist/api/core'
import { EventId, UserId } from '@wishlist/common'

import { GqlWishlist } from '../../wishlist/infrastructure/wishlist.dto'
import { GetEventsByUserQuery } from '../domain'
import { EventOutputPagedResponse, GqlEvent, GqlEventAttendee, GqlEventPaginationInput } from './event.dto'
import { eventMapper } from './event.mapper'

@Resolver(() => GqlEvent)
export class EventResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => GqlEvent, { nullable: true })
  getEventById(@Args('id') id: EventId, @Context() ctx: GraphQLContext): Promise<GqlEvent | null> {
    return ctx.loaders.event.load(id)
  }

  @Query(() => EventOutputPagedResponse)
  async getMyEvents(
    @Args('pagination') pagination: GqlEventPaginationInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<EventOutputPagedResponse> {
    const result = await this.queryBus.execute(
      new GetEventsByUserQuery({
        userId: currentUserId,
        pageNumber: pagination.page,
        pageSize: pagination.limit,
        ignorePastEvents: false,
      }),
    )

    return {
      resources: result.resources.map(eventMapper.toGqlEvent),
      pagination: {
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }

  @ResolveField(() => [GqlWishlist])
  async wishlists(@Parent() event: GqlEvent, @Context() ctx: GraphQLContext): Promise<GqlWishlist[]> {
    if (event.wishlistIds.length === 0) return []
    const wishlists = await ctx.loaders.wishlist.loadMany(event.wishlistIds)
    return wishlists.filter((wishlist): wishlist is GqlWishlist => wishlist !== null)
  }

  @ResolveField(() => [GqlEventAttendee])
  async attendees(@Parent() event: GqlEvent, @Context() ctx: GraphQLContext): Promise<GqlEventAttendee[]> {
    if (event.attendeeIds.length === 0) return []
    const attendees = await ctx.loaders.eventAttendee.loadMany(event.attendeeIds)
    return attendees.filter((attendee): attendee is GqlEventAttendee => attendee !== null)
  }
}
