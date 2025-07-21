import type { Event } from '@wishlist/api/event'
import type { User } from '@wishlist/api/user'

import type { EventAttendee } from '../event-attendee.model'

export class AttendeeAddedEvent {
  public readonly event: Event
  public readonly newAttendee: EventAttendee
  public readonly invitedBy: User

  constructor(props: { event: Event; newAttendee: EventAttendee; invitedBy: User }) {
    this.event = props.event
    this.newAttendee = props.newAttendee
    this.invitedBy = props.invitedBy
  }
}
