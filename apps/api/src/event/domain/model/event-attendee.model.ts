import type { User } from '@wishlist/api/user'
import type { AttendeeId, AttendeeRole, EventId } from '@wishlist/common'

export type EventAttendeeProps = {
  id: AttendeeId
  eventId: EventId
  user?: User
  pendingEmail?: string
  role: AttendeeRole
}

export class EventAttendee {
  public readonly id: AttendeeId
  public readonly eventId: EventId
  public readonly user?: User
  public readonly pendingEmail?: string
  public readonly role: AttendeeRole

  constructor(props: EventAttendeeProps) {
    if (props.user && props.pendingEmail) {
      throw new Error('Params "user" and "pendingEmail" cannot be provided together')
    }

    this.id = props.id
    this.eventId = props.eventId
    this.user = props.user
    this.pendingEmail = props.pendingEmail
    this.role = props.role
  }

  static createFromExistingUser(param: {
    id: AttendeeId
    eventId: EventId
    user: User
    role: AttendeeRole
  }): EventAttendee {
    return new EventAttendee({
      id: param.id,
      eventId: param.eventId,
      user: param.user,
      pendingEmail: undefined,
      role: param.role,
    })
  }

  static createFromNonExistingUser(param: {
    id: AttendeeId
    eventId: EventId
    pendingEmail: string
    role: AttendeeRole
  }): EventAttendee {
    return new EventAttendee({
      id: param.id,
      eventId: param.eventId,
      user: undefined,
      pendingEmail: param.pendingEmail,
      role: param.role,
    })
  }

  getEmail(): string {
    return this.user?.email ?? this.pendingEmail ?? ''
  }

  getFullNameOrPendingEmail(): string {
    return this.user?.firstName && this.user?.lastName
      ? `${this.user.firstName} ${this.user.lastName}`
      : (this.pendingEmail ?? '')
  }

  isLinkedToUser(): boolean {
    return this.user !== undefined
  }

  isTemporaryAttendee(): boolean {
    return this.pendingEmail !== undefined
  }
}
