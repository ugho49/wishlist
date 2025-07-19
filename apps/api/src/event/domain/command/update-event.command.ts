import type { EventId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type UpdateEvent = {
  title: string
  description?: string
  eventDate: Date
}

export class UpdateEventCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId
  public readonly updateEvent: UpdateEvent

  constructor(props: { currentUser: ICurrentUser; eventId: EventId; updateEvent: UpdateEvent }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
    this.updateEvent = props.updateEvent
  }
}
