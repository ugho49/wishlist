import { UserId } from '@wishlist/common'

export class EmailChangeVerificationCreatedEvent {
  public readonly userId: UserId
  public readonly oldEmail: string
  public readonly newEmail: string
  public readonly token: string

  constructor(props: { userId: UserId; oldEmail: string; newEmail: string; token: string }) {
    this.userId = props.userId
    this.oldEmail = props.oldEmail
    this.newEmail = props.newEmail
    this.token = props.token
  }
}
