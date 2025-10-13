import type { DrizzleTransaction } from '@wishlist/api/core'
import type { AttendeeId, EventId } from '@wishlist/common'
import type { EventAttendee } from '../model'

export interface EventAttendeeRepository {
  newId(): AttendeeId
  findById(id: AttendeeId): Promise<EventAttendee | undefined>
  findByIdOrFail(id: AttendeeId): Promise<EventAttendee>
  findByIds(ids: AttendeeId[]): Promise<EventAttendee[]>
  findByEventId(eventId: EventId): Promise<EventAttendee[]>
  findByTempEmail(email: string): Promise<EventAttendee[]>
  existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean>
  save(attendee: EventAttendee, tx?: DrizzleTransaction): Promise<void>
  delete(id: AttendeeId, tx?: DrizzleTransaction): Promise<void>
}
