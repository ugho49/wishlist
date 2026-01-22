import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
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

import { CreateEventUseCase } from '../../application/command/create-event.use-case'
import { DeleteEventUseCase } from '../../application/command/delete-event.use-case'
import { UpdateEventUseCase } from '../../application/command/update-event.use-case'
import { GetEventByIdUseCase } from '../../application/query/get-event-by-id.use-case'
import { GetEventsForUserUseCase } from '../../application/query/get-events-for-user.use-case'

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(
    private readonly getEventsForUserUseCase: GetEventsForUserUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  @Get()
  getMyEvents(
    @Query() queryParams: GetEventsQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.getEventsForUserUseCase.execute({
      userId: currentUserId,
      pageNumber: queryParams.p ?? 1,
      pageSize: queryParams.limit ?? DEFAULT_RESULT_NUMBER,
      ignorePastEvents: queryParams.only_future === undefined ? false : queryParams.only_future,
    })
  }

  @Get('/:id')
  getEventById(@Param('id') eventId: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<DetailedEventDto> {
    return this.getEventByIdUseCase.execute({ currentUser, eventId })
  }

  @Post()
  createEvent(@CurrentUser() currentUser: ICurrentUser, @Body() dto: CreateEventInputDto): Promise<MiniEventDto> {
    return this.createEventUseCase.execute({
      currentUser,
      newEvent: {
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        eventDate: dto.event_date,
        attendees: dto.attendees?.map(attendee => ({ email: attendee.email, role: attendee.role })),
      },
    })
  }

  @Put('/:id')
  async updateEvent(
    @Param('id') eventId: EventId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateEventInputDto,
  ): Promise<void> {
    await this.updateEventUseCase.execute({
      currentUser,
      eventId,
      updateEvent: {
        title: dto.title,
        description: dto.description,
        icon: dto.icon,
        eventDate: dto.event_date,
      },
    })
  }

  @Delete('/:id')
  async deleteEvent(@Param('id') eventId: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.deleteEventUseCase.execute({ currentUser, eventId })
  }
}
