import { Injectable } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { EventId, ICurrentUser } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetEventsByIdsQuery } from '../domain'
import { GqlEvent } from './event.dto'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventDataLoaderFactory {
  constructor(private readonly queryBus: QueryBus) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<EventId, GqlEvent | null>(async (eventIds: readonly EventId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all events (DataLoader requires same length array)
      if (!currentUser) return eventIds.map(() => null)

      const events = await this.queryBus.execute(new GetEventsByIdsQuery({ eventIds: [...eventIds], currentUser }))

      // Map events to maintain order and length matching input IDs
      const eventMap = new Map(events.map(e => [e.id, eventMapper.toGqlEvent(e)]))

      return eventIds.map(id => eventMap.get(id) ?? null)
    })
  }
}
