import type { ICurrentUser } from '@wishlist/common'

import { NotFoundException } from '@nestjs/common'
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser, IsAdmin } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER, GraphQLContext, ZodPipe } from '@wishlist/api/core'
import { AttendeeId, createPagedResponse, EventId } from '@wishlist/common'

import {
  AdminDeleteEventAttendeeResult,
  AdminDeleteEventResult,
  AdminEventPaginationFilters,
  AdminGetEventByIdResult,
  AdminGetEventsResult,
  AdminUpdateEventResult,
  Event as GqlEvent,
  UpdateEventInput,
} from '../../../gql/generated-types'
import { DeleteAttendeeUseCase } from '../../application/command/delete-attendee.use-case'
import { DeleteEventUseCase } from '../../application/command/delete-event.use-case'
import { UpdateEventUseCase } from '../../application/command/update-event.use-case'
import { GetEventsUseCase } from '../../application/query/get-events.use-case'
import { GetEventsForUserUseCase } from '../../application/query/get-events-for-user.use-case'
import {
  AdminEventPaginationFiltersSchema,
  AttendeeIdSchema,
  EventIdSchema,
  UpdateEventInputSchema,
} from '../event.schema'

@IsAdmin()
@Resolver()
export class EventAdminResolver {
  constructor(
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getEventsForUserUseCase: GetEventsForUserUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private readonly deleteAttendeeUseCase: DeleteAttendeeUseCase,
  ) {}

  @Query()
  async adminEvent(
    @Args('id', new ZodPipe(EventIdSchema)) id: EventId,
    @Context() ctx: GraphQLContext,
  ): Promise<AdminGetEventByIdResult> {
    // canView returns true for admins, so the dataloader resolves any event.
    const event = await ctx.loaders.event.load(id)
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`)
    }
    return event
  }

  @Query()
  async adminEvents(
    @Args('filters', new ZodPipe(AdminEventPaginationFiltersSchema)) filters: AdminEventPaginationFilters,
    @Context() ctx: GraphQLContext,
  ): Promise<AdminGetEventsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER
    const pageNumber = filters.page ?? 1

    const pagedDtos = filters.userId
      ? await this.getEventsForUserUseCase.execute({
          userId: filters.userId,
          pageNumber,
          pageSize,
          ignorePastEvents: false,
        })
      : await this.getEventsUseCase.execute({ pageNumber, pageSize })

    // Load full Event object types (with wishlistIds/attendeeIds) for the page of ids.
    const loadedEvents = await ctx.loaders.event.loadMany(pagedDtos.resources.map(event => event.id))
    const events = loadedEvents.filter((event): event is GqlEvent => event !== null && !(event instanceof Error))

    const pagedResponse = createPagedResponse({
      resources: events,
      options: {
        pageSize,
        totalElements: pagedDtos.pagination.total_elements,
        pageNumber,
      },
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

  @Mutation()
  async adminUpdateEvent(
    @Args('id', new ZodPipe(EventIdSchema)) id: EventId,
    @Args('input', new ZodPipe(UpdateEventInputSchema)) input: UpdateEventInput,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUpdateEventResult> {
    await this.updateEventUseCase.execute({
      currentUser,
      eventId: id,
      updateEvent: {
        title: input.title,
        description: input.description ?? undefined,
        icon: input.icon ?? undefined,
        eventDate: new Date(input.eventDate),
      },
    })

    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async adminDeleteEvent(
    @Args('id', new ZodPipe(EventIdSchema)) id: EventId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteEventResult> {
    await this.deleteEventUseCase.execute({ currentUser, eventId: id })
    return { __typename: 'VoidOutput', success: true }
  }

  @Mutation()
  async adminDeleteEventAttendee(
    @Args('eventId', new ZodPipe(EventIdSchema)) eventId: EventId,
    @Args('attendeeId', new ZodPipe(AttendeeIdSchema)) attendeeId: AttendeeId,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteEventAttendeeResult> {
    await this.deleteAttendeeUseCase.execute({ currentUser, eventId, attendeeId })
    return { __typename: 'VoidOutput', success: true }
  }
}
