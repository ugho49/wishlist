import type { BatchLoad } from '@znight/graphql';
import type { HttpContext } from '@znight/http';

import { type EventId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { requireCurrentUser } from '../../auth/infrastructure/auth.context';
import { type Event } from '../../gql/generated-types';
import { GetEventsByIdsUseCase } from '../application/query/get-events-by-ids.use-case';
import { eventMapper } from './event.mapper';

/** Events by id, as seen by the current user (`null` when not visible). */
@Injectable({ scope: 'request' })
export class EventsById implements BatchLoad<EventId, Event | null> {
  constructor(
    private readonly getEventsByIdsUseCase: GetEventsByIdsUseCase,
    private readonly http: HttpContext,
  ) {}

  async load(eventIds: readonly EventId[]): Promise<readonly (Event | null)[]> {
    const currentUser = requireCurrentUser(this.http);
    const events = await this.getEventsByIdsUseCase.execute({ eventIds: [...eventIds], currentUser });

    // Map events to maintain order and length matching input IDs
    const eventMap = new Map(events.map(e => [e.id, eventMapper.toGqlEvent(e)]));

    return eventIds.map(id => eventMap.get(id) ?? null);
  }
}
