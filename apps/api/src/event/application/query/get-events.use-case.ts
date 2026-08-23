import type { Event } from '../../domain/model/event.model';
import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetEventsInput = {
  pageNumber: number;
  pageSize: number;
};

export type GetEventsOutput = {
  events: Event[];
  totalCount: number;
};

@Injectable()
export class GetEventsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsInput): Promise<GetEventsOutput> {
    const { pageNumber, pageSize } = input;

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findAllPaginated({
      pagination: { take: pageSize, skip },
    });

    return { events, totalCount };
  }
}
