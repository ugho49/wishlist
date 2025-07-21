import type { ICurrentUser, UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

type UpdateUser = {
  email?: string
  newPassword?: string
  firstname?: string
  lastname?: string
  birthday?: Date
  isEnabled?: boolean
}

export class UpdateUserFullCommand extends Command<void> {
  public readonly userId: UserId
  public readonly currentUser: ICurrentUser
  public readonly updateUser: UpdateUser

  constructor(props: { userId: UserId; currentUser: ICurrentUser; updateUser: UpdateUser }) {
    super()
    this.userId = props.userId
    this.currentUser = props.currentUser
    this.updateUser = props.updateUser
  }
}
