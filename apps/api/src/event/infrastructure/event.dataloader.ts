import { Injectable } from '@nestjs/common'
import { EventId, ICurrentUser } from '@wishlist/common'
import DataLoader from 'dataloader'

import { Event } from '../../gql/generated-types'
import { GetEventsByIdsUseCase } from '../application/query/get-events-by-ids.use-case'
import { eventMapper } from './event.mapper'

@Injectable()
export class EventDataLoaderFactory {
  constructor(private readonly getEventsByIdsUseCase: GetEventsByIdsUseCase) {}

  createLoader(getCurrentUser: () => ICurrentUser | undefined) {
    return new DataLoader<EventId, Event | null>(async (eventIds: readonly EventId[]) => {
      const currentUser = getCurrentUser()

      // If no user, return null for all events (DataLoader requires same length array)
      if (!currentUser) return eventIds.map(() => null)

      const events = await this.getEventsByIdsUseCase.execute({ eventIds: [...eventIds], currentUser })

      // Map events to maintain order and length matching input IDs
      const eventMap = new Map(events.map(e => [e.id, eventMapper.toGqlEvent(e)]))

      return eventIds.map(id => eventMap.get(id) ?? null)
    })
  }
}
