import type { Event } from '../../domain/model/event.model';
import type { EventRepository } from '../../domain/repository/event.repository';

import { Injectable } from '@znight/core';
import { BadRequestException } from '@znight/http';

export type GetEventsInput = {
  pageNumber: number;
  pageSize: number;
  criteria?: string;
};

export type GetEventsOutput = {
  events: Event[];
  totalCount: number;
};

@Injectable()
export class GetEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsInput): Promise<GetEventsOutput> {
    const { pageNumber, pageSize, criteria } = input;
    const titleCriteria = criteria?.trim();

    if (titleCriteria && titleCriteria.length < 2) {
      throw new BadRequestException('Invalid search criteria');
    }

    const skip = (pageNumber - 1) * pageSize;

    const { totalCount, events } = await this.eventRepository.findAllPaginated({
      pagination: { take: pageSize, skip },
      criteria: titleCriteria || undefined,
    });

    return { events, totalCount };
  }
}
