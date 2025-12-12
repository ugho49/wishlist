import { Injectable, Logger } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { EventId, ICurrentUser } from '@wishlist/common'
import DataLoader from 'dataloader'

import { GetEventsByIdsQuery } from '../domain'
import { EventOutput } from './event.dto'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventDataLoaderFactory {
  private readonly logger = new Logger(EventDataLoaderFactory.name)

  constructor(private readonly queryBus: QueryBus) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<EventId, EventOutput | null>(async (eventIds: readonly EventId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all events (DataLoader requires same length array)
      if (!currentUser) return eventIds.map(() => null)

      this.logger.log(`Loading events for user ${currentUser.id}`, { eventIds })

      const events = await this.queryBus.execute(new GetEventsByIdsQuery({ eventIds: [...eventIds], currentUser }))

      // Map events to maintain order and length matching input IDs
      const eventMap = new Map(events.map(e => [e.id, eventMapper.toEventOutput(e)]))

      return eventIds.map(id => eventMap.get(id) ?? null)
    })
  }
}
