import type { Event } from '../../domain/model/event.model';
import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

type GetEventsByUserInput = {
  userId: UserId;
  pageNumber: number;
  pageSize: number;
  ignorePastEvents: boolean;
};

type GetEventsByUserResult = {
  events: Event[];
  totalCount: number;
};

@Injectable()
export class GetEventsByUserUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsByUserInput): Promise<GetEventsByUserResult> {
    const { userId, pageNumber, pageSize, ignorePastEvents } = input;

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findByUserIdPaginated({
      userId,
      pagination: { take: pageSize, skip },
      onlyFuture: ignorePastEvents,
    });

    return { events, totalCount };
  }
}
