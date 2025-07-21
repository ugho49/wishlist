import type { MiniUserDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type CreateUserResult = MiniUserDto

type NewUser = {
  firstname: string
  lastname: string
  email: string
  password: string
}

export class CreateUserCommand extends Command<CreateUserResult> {
  public readonly newUser: NewUser
  public readonly ip: string

  constructor(props: { newUser: NewUser; ip: string }) {
    super()
    this.newUser = props.newUser
    this.ip = props.ip
  }
}
