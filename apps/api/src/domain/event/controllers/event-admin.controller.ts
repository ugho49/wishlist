import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventService } from '../event.service';
import { DetailedEventDto, EventWithCountsDto, GetPaginationQueryDto, PagedResponse } from '@wishlist/common-types';
import { IsAdmin } from '../../auth';

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(private readonly eventService: EventService) {}

  @Get('/:id')
  getById(@Param('id') id: string): Promise<DetailedEventDto> {
    return this.eventService.findByIdForAdmin(id);
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetPaginationQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    return this.eventService.getAllPaginated(queryParams.p || 1);
  }
}
