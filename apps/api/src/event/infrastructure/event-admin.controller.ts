import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsAdmin } from '@wishlist/api/auth'
import {
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  GetAllEventsPaginationQueryDto,
  PagedResponse,
} from '@wishlist/common'

import { LegacyEventService } from './legacy-event.service'

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(private readonly eventService: LegacyEventService) {}

  @Get('/:id')
  getById(@Param('id') id: EventId): Promise<DetailedEventDto> {
    return this.eventService.findByIdForAdmin(id)
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllEventsPaginationQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getAllPaginated({ pageNumber: queryParams.p ?? 1, userId: queryParams.user_id })
  }
}
