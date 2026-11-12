import type { EventRepository } from '../../domain/repository/event.repository';

import { type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { Event } from '../../domain/model/event.model';

export type GetEventsByIdsInput = {
  currentUser: ICurrentUser;
  eventIds: EventId[];
};

@Injectable()
export class GetEventsByIdsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventsByIdsInput): Promise<Event[]> {
    const events = await this.eventRepository.findByIds(input.eventIds);

    return events.filter(event => event.canView(input.currentUser));
  }
}
