import type { AttendeeDto, AttendeeRole, EventId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type AddAttendeeResult = AttendeeDto

type NewAttendee = {
  email: string
  role?: AttendeeRole
}

export class AddAttendeeCommand extends Command<AddAttendeeResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId
  public readonly newAttendee: NewAttendee

  constructor(props: { currentUser: ICurrentUser; eventId: EventId; newAttendee: NewAttendee }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
    this.newAttendee = props.newAttendee
  }
}
