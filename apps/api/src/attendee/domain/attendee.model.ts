import type { User } from '@wishlist/api/user'
import type { AttendeeId, EventId } from '@wishlist/common'

import { AttendeeRole, uuid } from '@wishlist/common'

export type AttendeeProps = {
  id: AttendeeId
  eventId: EventId
  user?: User
  email?: string
  role: AttendeeRole
}

export class Attendee {
  public readonly id: AttendeeId
  public readonly eventId: EventId
  public readonly user?: User
  public readonly email?: string
  public readonly role: AttendeeRole

  constructor(props: AttendeeProps) {
    this.id = props.id
    this.eventId = props.eventId
    this.user = props.user
    this.email = props.email
    this.role = props.role
  }

  static create(param: { eventId: EventId; user?: User; email?: string; role?: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: param.user,
      email: param.email,
      role: param.role ?? AttendeeRole.USER,
    })
  }

  static fromExistingUser(param: { eventId: EventId; user: User; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: param.user,
      email: undefined,
      role: param.role,
    })
  }

  static fromNonExistingUser(param: { eventId: EventId; email: string; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      user: undefined,
      email: param.email,
      role: param.role,
    })
  }

  getUserEmailOrPendingEmail(): string {
    return this.user?.email ?? this.email ?? ''
  }

  getUserFullNameOrPendingEmail(): string {
    return this.user?.firstName && this.user?.lastName
      ? `${this.user.firstName} ${this.user.lastName}`
      : (this.email ?? '')
  }

  isLinkedToUser(): boolean {
    return this.user !== undefined
  }

  isTemporaryAttendee(): boolean {
    return this.user === undefined && this.email !== undefined
  }
}
