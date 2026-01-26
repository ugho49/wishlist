import { NotFoundException } from '@nestjs/common'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER, GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { createPagedResponse, EventId, UserId } from '@wishlist/common'

import {
  Event,
  EventAttendee,
  EventPaginationFilters,
  GetEventByIdResult,
  GetMyEventsResult,
  Wishlist,
} from '../../../gql/generated-types'
import { GetEventsByUserUseCase } from '../../application/query/get-events-by-user.use-case'
import { eventMapper } from '../event.mapper'
import { EventPaginationFiltersSchema } from '../event.schema'

@Resolver('Event')
export class EventResolver {
  constructor(private readonly getEventsByUserUseCase: GetEventsByUserUseCase) {}

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

  @Query()
  async getEventById(
    @Args('id', { type: () => String }) id: EventId,
    @Context() ctx: GraphQLContext,
  ): Promise<GetEventByIdResult> {
    const event = await ctx.loaders.event.load(id)
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`)
    }
    return event
  }

  @Query()
  async getMyEvents(
    @Args('filters', new ZodPipe(EventPaginationFiltersSchema)) filters: EventPaginationFilters,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GetMyEventsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER
    const pageNumber = filters.page ?? 1

    const { events, totalCount } = await this.getEventsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
      ignorePastEvents: false,
    })

    const pagedResponse = createPagedResponse({
      resources: events.map(eventMapper.toGqlEvent),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })

    return {
      __typename: 'GetEventsPagedResponse',
      data: pagedResponse.resources,
      pagination: {
        __typename: 'Pagination',
        totalPages: pagedResponse.pagination.total_pages,
        totalElements: pagedResponse.pagination.total_elements,
        pageNumber: pagedResponse.pagination.page_number,
        pageSize: pagedResponse.pagination.pages_size,
      },
    }
  }
}
