import type { AttendeeId, EventId, UserId } from '@wishlist/common'

import { AttendeeRole, uuid } from '@wishlist/common'

export type AttendeeProps = {
  id: AttendeeId
  eventId: EventId
  userId?: UserId
  email?: string
  role: AttendeeRole
}

export class Attendee {
  public readonly id: AttendeeId
  public readonly eventId: EventId
  public readonly userId?: UserId
  public readonly email?: string
  public readonly role: AttendeeRole

  constructor(props: AttendeeProps) {
    this.id = props.id
    this.eventId = props.eventId
    this.userId = props.userId
    this.email = props.email
    this.role = props.role
  }

  static create(param: { eventId: EventId; userId?: UserId; email?: string; role?: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      userId: param.userId,
      email: param.email,
      role: param.role ?? AttendeeRole.USER,
    })
  }

  static fromExistingUser(param: { eventId: EventId; userId: UserId; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      userId: param.userId,
      email: undefined,
      role: param.role,
    })
  }

  static fromNonExistingUser(param: { eventId: EventId; email: string; role: AttendeeRole }): Attendee {
    return new Attendee({
      id: uuid() as AttendeeId,
      eventId: param.eventId,
      userId: undefined,
      email: param.email,
      role: param.role,
    })
  }

  isLinkedToUser(): boolean {
    return this.userId !== undefined
  }

  isTemporaryAttendee(): boolean {
    return this.userId === undefined && this.email !== undefined
  }
}
