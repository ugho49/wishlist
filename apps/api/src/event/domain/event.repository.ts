import type { EventId } from '@wishlist/common'

import type { Event } from './event.model'

export interface EventRepository {
  findById(id: EventId): Promise<Event | undefined>
  findByIds(ids: EventId[]): Promise<Event[]>
  findByIdOrFail(id: EventId): Promise<Event>
  save(event: Event): Promise<void>
  delete(id: EventId): Promise<void>
}
