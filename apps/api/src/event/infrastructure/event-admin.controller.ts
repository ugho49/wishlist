import { Controller, Get, Param, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser, IsAdmin } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import {
  DetailedEventDto,
  EventId,
  EventWithCountsDto,
  GetAllEventsPaginationQueryDto,
  ICurrentUser,
  PagedResponse,
} from '@wishlist/common'

import { GetEventByIdQuery, GetEventsForUserQuery, GetEventsQuery } from '../domain'

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/:id')
  getById(@Param('id') id: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<DetailedEventDto> {
    return this.queryBus.execute(new GetEventByIdQuery({ currentUser, eventId: id }))
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllEventsPaginationQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    const pageNumber = queryParams.p ?? 1
    const pageSize = DEFAULT_RESULT_NUMBER

    if (queryParams.user_id) {
      return this.queryBus.execute(
        new GetEventsForUserQuery({
          userId: queryParams.user_id,
          pageNumber,
          pageSize,
          ignorePastEvents: false,
        }),
      )
    }

    return this.queryBus.execute(new GetEventsQuery({ pageNumber, pageSize }))
  }
}
