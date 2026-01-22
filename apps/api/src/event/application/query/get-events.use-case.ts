import { Inject, Injectable } from '@nestjs/common'
import { EventRepository, eventMapper } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse, EventWithCountsDto, PagedResponse } from '@wishlist/common'

export type GetEventsInput = {
  pageNumber: number
  pageSize: number
}

@Injectable()
export class GetEventsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsInput): Promise<PagedResponse<EventWithCountsDto>> {
    const { pageNumber, pageSize } = input

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
