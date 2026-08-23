import type { Event } from '../../domain/model/event.model';
import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

type GetEventsForUserInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
  ignorePastEvents: boolean;
};

export type GetEventsForUserOutput = {
  events: Event[];
  totalCount: number;
};

@Injectable()
export class GetEventsForUserUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsForUserInput): Promise<GetEventsForUserOutput> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = query;

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
    });

    return { events, totalCount };
  }
}
