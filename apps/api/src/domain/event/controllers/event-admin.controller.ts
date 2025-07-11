import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  GetAllEventsPaginationQueryDto,
  PagedResponse,
} from '@wishlist/common'

import { IsAdmin } from '../../auth'
import { EventService } from '../event.service'

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(private readonly eventService: EventService) {}

  @Get('/:id')
  getById(@Param('id') id: EventId): Promise<DetailedEventDto> {
    return this.eventService.findByIdForAdmin(id)
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllEventsPaginationQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getAllPaginated({ pageNumber: queryParams.p ?? 1, userId: queryParams.user_id })
  }
}
