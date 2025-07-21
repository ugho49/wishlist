export class PasswordVerificationCreatedEvent {
  public readonly email: string
  public readonly token: string

  constructor(props: { email: string; token: string }) {
    this.email = props.email
    this.token = props.token
  }
}
