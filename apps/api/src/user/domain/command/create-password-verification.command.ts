import { Command } from '@nestjs-architects/typed-cqrs'

export class CreatePasswordVerificationCommand extends Command<void> {
  public readonly email: string

  constructor(props: { email: string }) {
    super()
    this.email = props.email
  }
}
