import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { eventMapper, EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetEventsQuery, GetEventsResult } from '../../domain'

@QueryHandler(GetEventsQuery)
export class GetEventsUseCase implements IInferredQueryHandler<GetEventsQuery> {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsQuery): Promise<GetEventsResult> {
    const { pageNumber, pageSize } = query

    const skip = (pageNumber - 1) * pageSize

    const { totalCount, events } = await this.eventRepository.findAllPaginated({
      pagination: { take: pageSize, skip },
    })

    return createPagedResponse({
      resources: events.map(event => eventMapper.toEventWithCountsDto(event)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })
  }
}
