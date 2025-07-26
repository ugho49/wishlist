import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import {
  CreateEventInputDto,
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  GetEventsQueryDto,
  ICurrentUser,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
  UserId,
} from '@wishlist/common'

import {
  CreateEventCommand,
  DeleteEventCommand,
  GetEventByIdQuery,
  GetEventsForUserQuery,
  UpdateEventCommand,
} from '../../domain'

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getMyEvents(
    @Query() queryParams: GetEventsQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.queryBus.execute(
      new GetEventsForUserQuery({
        userId: currentUserId,
        pageNumber: queryParams.p ?? 1,
        pageSize: queryParams.limit ?? DEFAULT_RESULT_NUMBER,
        ignorePastEvents: queryParams.only_future === undefined ? false : queryParams.only_future,
      }),
    )
  }

  @Get('/:id')
  getEventById(@Param('id') eventId: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<DetailedEventDto> {
    return this.queryBus.execute(new GetEventByIdQuery({ currentUser, eventId }))
  }

  @Post()
  createEvent(@CurrentUser() currentUser: ICurrentUser, @Body() dto: CreateEventInputDto): Promise<MiniEventDto> {
    return this.commandBus.execute(
      new CreateEventCommand({
        currentUser,
        newEvent: {
          title: dto.title,
          description: dto.description,
          icon: dto.icon,
          eventDate: dto.event_date,
          attendees: dto.attendees?.map(attendee => ({
            email: attendee.email,
            role: attendee.role,
          })),
        },
      }),
    )
  }

  @Put('/:id')
  async updateEvent(
    @Param('id') eventId: EventId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateEventInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateEventCommand({
        currentUser,
        eventId,
        updateEvent: {
          title: dto.title,
          description: dto.description,
          icon: dto.icon,
          eventDate: dto.event_date,
        },
      }),
    )
  }

  @Delete('/:id')
  async deleteEvent(@Param('id') eventId: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(new DeleteEventCommand({ currentUser, eventId }))
  }
}
