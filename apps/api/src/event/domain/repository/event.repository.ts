import type { DrizzleTransaction } from '@wishlist/api/core'
import type { EventId, UserId } from '@wishlist/common'
import type { Event } from '../model'

export interface EventRepository {
  newId(): EventId
  findById(id: EventId): Promise<Event | undefined>
  findByIds(ids: EventId[]): Promise<Event[]>
  findByIdOrFail(id: EventId): Promise<Event>
  findByUserIdPaginated(params: {
    userId: UserId
    pagination: { take: number; skip: number }
    onlyFuture: boolean
  }): Promise<{ events: Event[]; totalCount: number }>
  findAllPaginated(params: {
    pagination: { take: number; skip: number }
  }): Promise<{ events: Event[]; totalCount: number }>
  save(event: Event, tx?: DrizzleTransaction): Promise<void>
  delete(id: EventId, tx?: DrizzleTransaction): Promise<void>
}
