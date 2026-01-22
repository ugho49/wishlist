import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common'
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

import { DeleteEventUseCase } from '../../application/command/delete-event.use-case'
import { UpdateEventUseCase } from '../../application/command/update-event.use-case'
import { GetEventByIdUseCase } from '../../application/query/get-event-by-id.use-case'
import { GetEventsUseCase } from '../../application/query/get-events.use-case'
import { GetEventsForUserUseCase } from '../../application/query/get-events-for-user.use-case'

@IsAdmin()
@ApiTags('ADMIN - Event')
@Controller('/admin/event')
export class EventAdminController {
  constructor(
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getEventsForUserUseCase: GetEventsForUserUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  @Get('/:id')
  getById(@Param('id') id: EventId, @CurrentUser() currentUser: ICurrentUser): Promise<DetailedEventDto> {
    return this.getEventByIdUseCase.execute({ currentUser, eventId: id })
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllEventsPaginationQueryDto): Promise<PagedResponse<EventWithCountsDto>> {
    const pageNumber = queryParams.p ?? 1
    const pageSize = DEFAULT_RESULT_NUMBER

    if (queryParams.user_id) {
      return this.getEventsForUserUseCase.execute({
        userId: queryParams.user_id,
        pageNumber,
        pageSize,
        ignorePastEvents: false,
      })
    }

    return this.getEventsUseCase.execute({ pageNumber, pageSize })
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
