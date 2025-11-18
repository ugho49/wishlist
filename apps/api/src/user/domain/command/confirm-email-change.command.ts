import { Command } from '@nestjs-architects/typed-cqrs'

export class ConfirmEmailChangeCommand extends Command<void> {
  public readonly newEmail: string
  public readonly token: string

  constructor(props: { newEmail: string; token: string }) {
    super()
    this.newEmail = props.newEmail
    this.token = props.token
  }
}
