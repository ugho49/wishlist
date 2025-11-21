import type { ICurrentUser } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class CreateEmailChangeVerificationCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly newEmail: string
  public readonly password?: string

  constructor(props: { currentUser: ICurrentUser; newEmail: string; password?: string }) {
    super()
    this.currentUser = props.currentUser
    this.newEmail = props.newEmail
    this.password = props.password
  }
}
