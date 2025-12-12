import type { AttendeeId } from '@wishlist/common'
import type { EventAttendee } from '../model/event-attendee.model'

import { Query } from '@nestjs-architects/typed-cqrs'

export class GetEventAttendeesByIdsQuery extends Query<EventAttendee[]> {
  public readonly attendeeIds: AttendeeId[]

  constructor(props: { attendeeIds: AttendeeId[] }) {
    super()
    this.attendeeIds = props.attendeeIds
  }
}
