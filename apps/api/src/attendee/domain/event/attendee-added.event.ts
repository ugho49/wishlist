import type { Event } from '@wishlist/api/event'
import type { User } from '@wishlist/api/user'

import type { Attendee } from '../attendee.model'

export class AttendeeAddedEvent {
  public readonly event: Event
  public readonly newAttendee: Attendee
  public readonly invitedBy: User

  constructor(props: { event: Event; newAttendee: Attendee; invitedBy: User }) {
    this.event = props.event
    this.newAttendee = props.newAttendee
    this.invitedBy = props.invitedBy
  }
}
