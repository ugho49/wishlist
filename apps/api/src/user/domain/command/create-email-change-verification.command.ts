import type { ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class CreateEmailChangeVerificationCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly newEmail: string

  constructor(props: { currentUser: ICurrentUser; newEmail: string }) {
    super()
    this.currentUser = props.currentUser
    this.newEmail = props.newEmail
  }
}
