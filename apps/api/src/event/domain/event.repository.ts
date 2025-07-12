import type { EventId } from '@wishlist/common'

import type { Event } from './event.model'

export interface EventRepository {
  findById(id: EventId): Promise<Event | undefined>
  findByIdOrFail(id: EventId): Promise<Event>
  save(event: Event): Promise<void>
  delete(id: EventId): Promise<void>
}
