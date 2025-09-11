import type { LoginOutputDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type LoginWithGoogleResult = LoginOutputDto

export class LoginWithGoogleCommand extends Command<LoginWithGoogleResult> {
  public readonly code: string
  public readonly ip: string
  public readonly createUserIfNotExists: boolean

  constructor(props: { code: string; ip: string; createUserIfNotExists: boolean }) {
    super()
    this.code = props.code
    this.ip = props.ip
    this.createUserIfNotExists = props.createUserIfNotExists
  }
}
