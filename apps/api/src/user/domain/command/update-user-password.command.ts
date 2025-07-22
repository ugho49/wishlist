import type { UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UpdateUserPasswordCommand extends Command<void> {
  public readonly userId: UserId
  public readonly oldPassword: string
  public readonly newPassword: string

  constructor(props: { userId: UserId; oldPassword: string; newPassword: string }) {
    super()
    this.userId = props.userId
    this.oldPassword = props.oldPassword
    this.newPassword = props.newPassword
  }
}
