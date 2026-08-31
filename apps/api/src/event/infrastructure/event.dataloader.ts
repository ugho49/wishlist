import { Injectable } from '@nestjs/common';
import { type EventId, type ICurrentUser } from '@wishlist/common';
import DataLoader from 'dataloader';

import { type Event } from '../../gql/generated-types';
import { GetEventsByIdsUseCase } from '../application/query/get-events-by-ids.use-case';
import { eventMapper } from './event.mapper';

@Injectable()
export class EventDataLoaderFactory {
  constructor(private readonly getEventsByIdsUseCase: GetEventsByIdsUseCase) {}

  createLoader(currentUser: ICurrentUser) {
    return new DataLoader<EventId, Event | null>(async (eventIds: readonly EventId[]) => {
      const events = await this.getEventsByIdsUseCase.execute({ eventIds: [...eventIds], currentUser });

      // Map events to maintain order and length matching input IDs
      const eventMap = new Map(events.map(e => [e.id, eventMapper.toGqlEvent(e)]));

      return eventIds.map(id => eventMap.get(id) ?? null);
    });
  }
}
