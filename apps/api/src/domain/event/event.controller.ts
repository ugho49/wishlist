import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';
import {
  CreateEventInputDto,
  DetailedEventDto,
  EventWithCountsDto,
  GetPaginationQueryDto,
  MiniEventDto,
  PagedResponse,
} from '@wishlist/common-types';
import { CurrentUser, ICurrentUser } from '../auth';

@ApiTags('Event')
@Controller('/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async getMyEvents(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getUserEventsPaginated({ pageNumber: queryParams.p, currentUserId });
  }

  @Get('/:id')
  async getEventById(
    @Param('id') eventId: string,
    @CurrentUser('id') currentUserId: string
  ): Promise<DetailedEventDto> {
    return this.eventService.findById({ eventId, currentUserId });
  }

  @Post()
  async createEvent(@CurrentUser() currentUser: ICurrentUser, @Body() dto: CreateEventInputDto): Promise<MiniEventDto> {
    return this.eventService.create({ dto, currentUser });
  }
}
