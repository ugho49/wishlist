import type { UserId, UserSocialId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UnlinkUserSocialCommand extends Command<void> {
  public readonly userId: UserId
  public readonly socialId: UserSocialId

  constructor(props: { userId: UserId; socialId: UserSocialId }) {
    super()
    this.userId = props.userId
    this.socialId = props.socialId
  }
}
