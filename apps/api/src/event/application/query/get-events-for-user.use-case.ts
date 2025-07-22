import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { eventMapper, EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetEventsForUserQuery, GetEventsForUserResult } from '../../domain'

@QueryHandler(GetEventsForUserQuery)
export class GetEventsForUserUseCase implements IInferredQueryHandler<GetEventsForUserQuery> {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsForUserQuery): Promise<GetEventsForUserResult> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = query

    const skip = (pageNumber - 1) * pageSize

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
    })

    return createPagedResponse({
      resources: events.map(event => eventMapper.toEventWithCountsDto(event)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })
  }
}
