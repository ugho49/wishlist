import type { LoginOutputDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type LoginResult = LoginOutputDto

export class LoginCommand extends Command<LoginResult> {
  public readonly email: string
  public readonly password: string
  public readonly ip: string

  constructor(props: { email: string; password: string; ip: string }) {
    super()
    this.email = props.email
    this.password = props.password
    this.ip = props.ip
  }
}
