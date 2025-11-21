export class EmailChangeVerificationCreatedEvent {
  public readonly oldEmail: string
  public readonly newEmail: string
  public readonly token: string

  constructor(props: { oldEmail: string; newEmail: string; token: string }) {
    this.oldEmail = props.oldEmail
    this.newEmail = props.newEmail
    this.token = props.token
  }
}
