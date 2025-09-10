import type { UserId, UserSocialDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type LinkUserToGoogleResult = UserSocialDto
export class LinkUserToGoogleCommand extends Command<LinkUserToGoogleResult> {
  public readonly code: string
  public readonly userId: UserId

  constructor(props: { code: string; userId: UserId }) {
    super()
    this.code = props.code
    this.userId = props.userId
  }
}
