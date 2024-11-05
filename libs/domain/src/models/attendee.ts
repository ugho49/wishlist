import { Brand, uuid } from '@wishlist/common'

import { AttendeeRole } from '../enums'
import { EventId } from './event'
import { User } from './user'

export type AttendeeId = Brand<string, 'AttendeeId'>

export class Attendee {
  public readonly id: AttendeeId
  public readonly eventId: EventId
  public readonly role: AttendeeRole
  public readonly tempUserEmail?: string
  public readonly user?: User

  constructor(props: { id: AttendeeId; eventId: EventId; role: AttendeeRole; tempUserEmail?: string; user?: User }) {
    this.id = props.id
    this.eventId = props.eventId
    this.role = props.role
    this.tempUserEmail = props.tempUserEmail
    this.user = props.user

    if (!this.user && !this.tempUserEmail) {
      throw new Error('User or tempUserEmail must be provided')
    }
  }

  static getNewId(): AttendeeId {
    return uuid() as AttendeeId
  }
}
