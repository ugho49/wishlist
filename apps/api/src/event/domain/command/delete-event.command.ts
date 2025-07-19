import type { EventId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteEventCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
  }
}
