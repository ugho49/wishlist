import type { UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type UpdateUser = {
  firstname: string
  lastname: string
  birthday?: Date
}

export class UpdateUserCommand extends Command<void> {
  public readonly userId: UserId
  public readonly updateUser: UpdateUser

  constructor(props: { userId: UserId; updateUser: UpdateUser }) {
    super()
    this.userId = props.userId
    this.updateUser = props.updateUser
  }
}
