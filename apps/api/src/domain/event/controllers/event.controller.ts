import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from '../event.service';
import {
  CreateEventInputDto,
  DetailedEventDto,
  EventWithCountsDto,
  GetPaginationQueryDto,
  MiniEventDto,
  PagedResponse,
  UpdateEventInputDto,
  ICurrentUser,
} from '@wishlist/common-types';
import { CurrentUser } from '../../auth';

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getMyEvents(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getUserEventsPaginated({ pageNumber: queryParams.p || 0, currentUserId });
  }

  @Get('/:id')
  getEventById(@Param('id') eventId: string, @CurrentUser('id') currentUserId: string): Promise<DetailedEventDto> {
    return this.eventService.findById({ eventId, currentUserId });
  }

  @Post()
  createEvent(@CurrentUser() currentUser: ICurrentUser, @Body() dto: CreateEventInputDto): Promise<MiniEventDto> {
    return this.eventService.create({ dto, currentUser });
  }

  @Put('/:id')
  updateEvent(
    @Param('id') eventId: string,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateEventInputDto
  ): Promise<void> {
    return this.eventService.updateEvent({ eventId, currentUser, dto });
  }

  @Delete('/:id')
  deleteEvent(@Param('id') eventId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.eventService.deleteEvent({ eventId, currentUser });
  }
}
