import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
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
} from '@wishlist/common-types'

import { CurrentUser } from '../../auth'
import { EventService } from '../event.service'

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getMyEvents(
    @Query() queryParams: GetEventsQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getUserEventsPaginated({
      pageNumber: queryParams.p || 1,
      currentUserId,
      limit: queryParams.limit,
      onlyFuture: queryParams.only_future === undefined ? false : queryParams.only_future,
    })
  }

  @Get('/:id')
  getEventById(@Param('id') eventId: EventId, @CurrentUser('id') currentUserId: UserId): Promise<DetailedEventDto> {
    return this.eventService.findById({ eventId, currentUserId })
  }

  @Post()
  createEvent(@CurrentUser() currentUser: ICurrentUser, @Body() dto: CreateEventInputDto): Promise<MiniEventDto> {
    return this.eventService.create({ dto, currentUser })
  }

  @Put('/:id')
  updateEvent(
    @Param('id') eventId: EventId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateEventInputDto,
  ): Promise<void> {
    return this.eventService.updateEvent({ eventId, currentUser, dto })
  }

  @Delete('/:id')
  deleteEvent(@Param('id') eventId: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.eventService.deleteEvent({ eventId, currentUser })
  }
}
