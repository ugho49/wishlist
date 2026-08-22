import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';
import { createPagedResponse, EventWithCountsDto, PagedResponse, type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { eventMapper } from '../../infrastructure/event.mapper';

type GetEventsForUserInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
  ignorePastEvents: boolean;
};

@Injectable()
export class GetEventsForUserUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsForUserInput): Promise<PagedResponse<EventWithCountsDto>> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = query;

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
    });

    return createPagedResponse({
      resources: events.map(event => eventMapper.toEventWithCountsDto(event)),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });
  }
}
