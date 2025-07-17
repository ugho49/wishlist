import type { User } from '@wishlist/api/user'
import type { AttendeeId, EventId } from '@wishlist/common'

import { AttendeeRole, uuid } from '@wishlist/common'

export type AttendeeProps = {
  id: AttendeeId
  eventId: EventId
  user?: User
  pendingEmail?: string
  role: AttendeeRole
}

export class Attendee {
  public readonly id: AttendeeId
  public readonly eventId: EventId
  public readonly user?: User
  public readonly pendingEmail?: string
  public readonly role: AttendeeRole

  constructor(props: AttendeeProps) {
    this.id = props.id
    this.eventId = props.eventId
    this.user = props.user
    this.pendingEmail = props.pendingEmail
    this.role = props.role
  }

  static create(param: { eventId: EventId; user?: User; pendingEmail?: string; role?: AttendeeRole }): Attendee {
    if (param.user && param.pendingEmail) {
      throw new Error('Params "user" and "pendingEmail" cannot be provided together')
    }

    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: param.user,
      pendingEmail: param.pendingEmail,
      role: param.role ?? AttendeeRole.USER,
    })
  }

  static fromExistingUser(param: { eventId: EventId; user: User; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: param.user,
      pendingEmail: undefined,
      role: param.role,
    })
  }

  static fromNonExistingUser(param: { eventId: EventId; pendingEmail: string; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: undefined,
      pendingEmail: param.pendingEmail,
      role: param.role,
    })
  }

  getUserEmailOrPendingEmail(): string {
    return this.user?.email ?? this.pendingEmail ?? ''
  }

  getUserFullNameOrPendingEmail(): string {
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
