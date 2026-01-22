import type { Event } from '../../domain'

import { Inject, Injectable } from '@nestjs/common'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse, PagedResponse, UserId } from '@wishlist/common'

type GetEventsByUserInput = {
  userId: UserId
  pageNumber: number
  pageSize: number
  ignorePastEvents: boolean
}

@Injectable()
export class GetEventsByUserUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsByUserInput): Promise<PagedResponse<Event>> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = input

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
