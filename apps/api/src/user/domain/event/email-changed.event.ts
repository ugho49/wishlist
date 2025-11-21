import type { UserId } from '@wishlist/common'

export class EmailChangedEvent {
  public readonly userId: UserId
  public readonly oldEmail: string
  public readonly newEmail: string

  constructor(props: { userId: UserId; oldEmail: string; newEmail: string }) {
    this.userId = props.userId
    this.oldEmail = props.oldEmail
    this.newEmail = props.newEmail
  }
}
