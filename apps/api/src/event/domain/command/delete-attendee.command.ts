import type { AttendeeId, EventId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteAttendeeCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly attendeeId: AttendeeId
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; attendeeId: AttendeeId; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.attendeeId = props.attendeeId
    this.eventId = props.eventId
  }
}
