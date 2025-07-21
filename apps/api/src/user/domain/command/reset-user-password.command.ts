import { Command } from '@nestjs-architects/typed-cqrs'

export class ResetUserPasswordCommand extends Command<void> {
  public readonly email: string
  public readonly token: string
  public readonly newPassword: string

  constructor(props: { email: string; token: string; newPassword: string }) {
    super()
    this.email = props.email
    this.token = props.token
    this.newPassword = props.newPassword
  }
}
