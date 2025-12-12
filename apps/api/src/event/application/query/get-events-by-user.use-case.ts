import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetEventsByUserQuery, GetEventsByUserResult } from '../../domain'

@QueryHandler(GetEventsByUserQuery)
export class GetEventsByUserUseCase implements IInferredQueryHandler<GetEventsByUserQuery> {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsByUserQuery): Promise<GetEventsByUserResult> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = query

    const skip = (pageNumber - 1) * pageSize

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
    })

    return createPagedResponse({
      resources: events,
      options: { pageSize, totalElements: totalCount, pageNumber },
    })
  }
}
