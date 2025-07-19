import type { AttendeeRole, ICurrentUser, MiniEventDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type NewEventAttendee = {
  email: string
  role?: AttendeeRole
}

type NewEvent = {
  title: string
  description?: string
  eventDate: Date
  attendees?: NewEventAttendee[]
}

export type CreateEventResult = MiniEventDto

export class CreateEventCommand extends Command<CreateEventResult> {
  public readonly currentUser: ICurrentUser
  public readonly newEvent: NewEvent

  constructor(props: { currentUser: ICurrentUser; newEvent: NewEvent }) {
    super()
    this.currentUser = props.currentUser
    this.newEvent = props.newEvent
  }
}
