import type { AttendeeId, EventId } from '@wishlist/common'

import type { Attendee } from './attendee.model'

export interface AttendeeRepository {
  findById(id: AttendeeId): Promise<Attendee | undefined>
  findByIds(ids: AttendeeId[]): Promise<Attendee[]>
  findByEventId(eventId: EventId): Promise<Attendee[]>
  existByEventAndEmail(param: { eventId: EventId; email: string }): Promise<boolean>
  save(attendee: Attendee): Promise<void>
  delete(id: AttendeeId): Promise<void>
}
