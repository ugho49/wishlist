import type { Event } from '../../domain/model/event.model';
import type { EventRepository } from '../../domain/repository/event.repository';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

type GetEventsForUserInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
  ignorePastEvents: boolean;
  criteria?: string;
};

export type GetEventsForUserOutput = {
  events: Event[];
  totalCount: number;
};

@Injectable()
export class GetEventsForUserUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(query: GetEventsForUserInput): Promise<GetEventsForUserOutput> {
    const { userId, pageNumber, pageSize, ignorePastEvents, criteria } = query;
    const titleCriteria = criteria?.trim();

    if (titleCriteria && titleCriteria.length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
      criteria: titleCriteria || undefined,
    });

    return { events, totalCount };
  }
}
