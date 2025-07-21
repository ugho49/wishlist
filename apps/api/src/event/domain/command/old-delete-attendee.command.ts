import type { AttendeeId, ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

/**
 * @deprecated
 */
export class OldDeleteAttendeeCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly attendeeId: AttendeeId

  constructor(props: { currentUser: ICurrentUser; attendeeId: AttendeeId }) {
    super()
    this.currentUser = props.currentUser
    this.attendeeId = props.attendeeId
  }
}
