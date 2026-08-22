import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';
import { createPagedResponse, EventWithCountsDto, PagedResponse } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { eventMapper } from '../../infrastructure/event.mapper';

export type GetEventsInput = {
  pageNumber: number;
  pageSize: number;
};

@Injectable()
export class GetEventsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsInput): Promise<PagedResponse<EventWithCountsDto>> {
    const { pageNumber, pageSize } = input;

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findAllPaginated({
      pagination: { take: pageSize, skip },
    });

    return createPagedResponse({
      resources: events.map(event => eventMapper.toEventWithCountsDto(event)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });
  }
}
