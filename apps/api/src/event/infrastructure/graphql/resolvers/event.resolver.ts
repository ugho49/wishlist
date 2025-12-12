import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { AttendeeId, EventId, ICurrentUser, UserId } from '@wishlist/common'

import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  AddAttendeeCommand,
  CreateEventCommand,
  DeleteAttendeeCommand,
  DeleteEventCommand,
  GetEventByIdQuery,
  GetEventsForUserQuery,
  UpdateEventCommand,
} from '../../../domain'
import { eventGraphQLMapper } from '../mappers'
import {
  AddAttendeeInput,
  AttendeeObject,
  CreateEventInput,
  DetailedEventObject,
  EventsPageObject,
  GetEventsInput,
  MiniEventObject,
  UpdateEventInput,
} from '../types'

@Resolver()
@UseGuards(GqlAuthGuard)
export class EventResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => EventsPageObject, { name: 'myEvents', description: 'Get paginated list of my events' })
  async myEvents(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('input', { nullable: true }) input?: GetEventsInput,
  ): Promise<EventsPageObject> {
    const result = await this.queryBus.execute(
      new GetEventsForUserQuery({
        userId: currentUserId,
        pageNumber: input?.page ?? 1,
        pageSize: input?.limit ?? DEFAULT_RESULT_NUMBER,
        ignorePastEvents: input?.onlyFuture ?? false,
      }),
    )
    return eventGraphQLMapper.toEventsPageObject(result)
  }

  @Query(() => DetailedEventObject, { name: 'event', description: 'Get event by ID with details' })
  async event(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) eventId: EventId,
  ): Promise<DetailedEventObject> {
    const result = await this.queryBus.execute(new GetEventByIdQuery({ currentUser, eventId }))
    return eventGraphQLMapper.toDetailedEventObject(result)
  }

  @Mutation(() => MiniEventObject, { name: 'createEvent', description: 'Create a new event' })
  async createEvent(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: CreateEventInput,
  ): Promise<MiniEventObject> {
    const result = await this.commandBus.execute(
      new CreateEventCommand({
        currentUser,
        newEvent: {
          title: input.title,
          description: input.description,
          icon: input.icon,
          eventDate: new Date(input.eventDate),
          attendees: input.attendees?.map(attendee => ({
            email: attendee.email.toLowerCase(),
            role: attendee.role,
          })),
        },
      }),
    )
    return eventGraphQLMapper.toMiniEventObject(result)
  }

  @Mutation(() => Boolean, { name: 'updateEvent', description: 'Update an existing event' })
  async updateEvent(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) eventId: EventId,
    @Args('input') input: UpdateEventInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateEventCommand({
        currentUser,
        eventId,
        updateEvent: {
          title: input.title,
          description: input.description,
          icon: input.icon,
          eventDate: new Date(input.eventDate),
        },
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'deleteEvent', description: 'Delete an event' })
  async deleteEvent(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) eventId: EventId,
  ): Promise<boolean> {
    await this.commandBus.execute(new DeleteEventCommand({ currentUser, eventId }))
    return true
  }

  @Mutation(() => AttendeeObject, { name: 'addEventAttendee', description: 'Add an attendee to an event' })
  async addEventAttendee(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('eventId', { type: () => ID }) eventId: EventId,
    @Args('input') input: AddAttendeeInput,
  ): Promise<AttendeeObject> {
    const result = await this.commandBus.execute(
      new AddAttendeeCommand({
        currentUser,
        eventId,
        newAttendee: {
          email: input.email.toLowerCase(),
          role: input.role,
        },
      }),
    )
    return eventGraphQLMapper.toAttendeeObject(result)
  }

  @Mutation(() => Boolean, { name: 'deleteEventAttendee', description: 'Remove an attendee from an event' })
  async deleteEventAttendee(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('eventId', { type: () => ID }) eventId: EventId,
    @Args('attendeeId', { type: () => ID }) attendeeId: string,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new DeleteAttendeeCommand({
        currentUser,
        eventId,
        attendeeId: attendeeId as AttendeeId,
      }),
    )
    return true
  }
}
