/** A reset password email must be sent with this code: a new one, or a still valid one sent again. */
export class PasswordResetRequestedEvent {
  public readonly email: string;
  public readonly token: string;

  constructor(props: { email: string; token: string }) {
    this.email = props.email;
    this.token = props.token;
  }
}
