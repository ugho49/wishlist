import type { MiniUserDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type CreateUserFromGoogleResult = MiniUserDto

export class CreateUserFromGoogleCommand extends Command<CreateUserFromGoogleResult> {
  public readonly credential: string
  public readonly ip: string

  constructor(props: { credential: string; ip: string }) {
    super()
    this.credential = props.credential
    this.ip = props.ip
  }
}
