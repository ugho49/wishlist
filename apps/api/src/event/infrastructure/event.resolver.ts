import { QueryBus } from '@nestjs/cqrs'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContextEnum } from '@wishlist/api/core'
import { AttendeeId, EventId, UserId, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { WishlistOutput } from '../../wishlist/infrastructure/wishlist.dto'
import { GetEventsByUserQuery } from '../domain'
import { EventAttendeeOutput, EventOutput, EventOutputPagedResponse, EventPaginationInput } from './event.dto'
import { eventMapper } from './event.mapper'

@Resolver(() => EventOutput)
export class EventResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => EventOutput, { nullable: true })
  getEventById(
    @Args('id') id: EventId,
    @Context(GraphQLContextEnum.EVENT_DATA_LOADER) dataLoader: DataLoader<EventId, EventOutput | null>,
  ): Promise<EventOutput | null> {
    return dataLoader.load(id)
  }

  @Query(() => EventOutputPagedResponse)
  async getMyEvents(
    @Args('pagination') pagination: EventPaginationInput,
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
      resources: result.resources.map(eventMapper.toEventOutput),
      pagination: {
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }

  @ResolveField(() => [WishlistOutput])
  async wishlists(
    @Parent() parent: EventOutput,
    @Context(GraphQLContextEnum.WISHLIST_DATA_LOADER) dataLoader: DataLoader<WishlistId, WishlistOutput | null>,
  ): Promise<WishlistOutput[]> {
    if (parent.wishlistIds.length === 0) return []
    const wishlists = await Promise.all(parent.wishlistIds.map(wishlistId => dataLoader.load(wishlistId)))
    // Filter out null values (wishlists user doesn't have access to)
    return wishlists.filter((wishlist): wishlist is WishlistOutput => wishlist !== null)
  }

  @ResolveField(() => [EventAttendeeOutput])
  async attendees(
    @Parent() parent: EventOutput,
    @Context(GraphQLContextEnum.EVENT_ATTENDEE_DATA_LOADER) dataLoader: DataLoader<
      AttendeeId,
      EventAttendeeOutput | null
    >,
  ): Promise<EventAttendeeOutput[]> {
    if (parent.attendeeIds.length === 0) return []
    const attendees = await Promise.all(parent.attendeeIds.map(attendeeId => dataLoader.load(attendeeId)))
    return attendees.filter((attendee): attendee is EventAttendeeOutput => attendee !== null)
  }
}
