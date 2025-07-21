import type { User } from '../model'

export class UserCreatedEvent {
  public readonly user: User

  constructor(props: { user: User }) {
    this.user = props.user
  }
}
