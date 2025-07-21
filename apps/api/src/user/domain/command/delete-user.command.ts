import type { ICurrentUser, UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteUserCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly userId: UserId

  constructor(props: { currentUser: ICurrentUser; userId: UserId }) {
    super()
    this.currentUser = props.currentUser
    this.userId = props.userId
  }
}
