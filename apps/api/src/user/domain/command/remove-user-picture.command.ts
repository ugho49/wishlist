import type { UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class RemoveUserPictureCommand extends Command<void> {
  public readonly userId: UserId

  constructor(props: { userId: UserId }) {
    super()
    this.userId = props.userId
  }
}
