import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
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
  UpdateEventInputDto,
} from '@wishlist/common'

import {
  DeleteEventCommand,
  GetEventByIdQuery,
  GetEventsForUserQuery,
  GetEventsQuery,
  UpdateEventCommand,
} from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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
