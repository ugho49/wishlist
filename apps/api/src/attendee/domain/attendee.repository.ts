import type { DrizzleTransaction } from '@wishlist/api/core'
import type { AttendeeId, EventId } from '@wishlist/common'

import type { Attendee } from './attendee.model'

export interface AttendeeRepository {
  newId(): AttendeeId
  findById(id: AttendeeId): Promise<Attendee | undefined>
  findByIdOrFail(id: AttendeeId): Promise<Attendee>
  findByIds(ids: AttendeeId[]): Promise<Attendee[]>
  findByEventId(eventId: EventId): Promise<Attendee[]>
  existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean>
  save(attendee: Attendee, tx?: DrizzleTransaction): Promise<void>
  delete(id: AttendeeId, tx?: DrizzleTransaction): Promise<void>
}
