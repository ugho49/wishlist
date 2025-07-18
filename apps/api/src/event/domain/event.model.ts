import type { Attendee } from '@wishlist/api/attendee'
import type { EventId, ICurrentUser, UserId } from '@wishlist/common'

import { AttendeeRole } from '@wishlist/common'

export type EventProps = {
  id: EventId
  title: string
  description?: string
  eventDate: Date
  attendees: Attendee[]
  createdAt: Date
  updatedAt: Date
}

export class Event {
  public readonly id: EventId
  public readonly title: string
  public readonly description?: string
  public readonly eventDate: Date
  public readonly attendees: Attendee[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: EventProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.eventDate = props.eventDate
    this.attendees = props.attendees
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(param: {
    id: EventId
    title: string
    description?: string
    eventDate: Date
    attendees: Attendee[]
  }): Event {
    if (param.attendees.length === 0) {
      throw new Error('Event must have at least one attendee')
    }

    const now = new Date()

    return new Event({
      id: param.id,
      title: param.title,
      description: param.description,
      eventDate: param.eventDate,
      attendees: param.attendees,
      createdAt: now,
      updatedAt: now,
    })
  }

  static canAccessByRole(params: {
    currentUser: ICurrentUser
    attendees: Attendee[]
    acceptedRoles: AttendeeRole[]
  }): boolean {
    const { currentUser, attendees } = params
    if (currentUser.isAdmin) return true
    const attendee = attendees.find(a => a.user?.id === currentUser.id)
    if (!attendee) return false
    return params.acceptedRoles.includes(attendee.role)
  }

  static canEdit(params: { currentUser: ICurrentUser; attendees: Attendee[] }): boolean {
    return this.canAccessByRole({
      ...params,
      acceptedRoles: [AttendeeRole.MAINTAINER],
    })
  }

  static canView(params: { currentUser: ICurrentUser; attendees: Attendee[] }): boolean {
    return this.canAccessByRole({
      ...params,
      acceptedRoles: [AttendeeRole.MAINTAINER, AttendeeRole.USER],
    })
  }

  static canAddWishlist(params: { currentUserId: UserId; attendees: Attendee[] }): boolean {
    const { currentUserId, attendees } = params
    return attendees.some(a => a.user?.id === currentUserId)
  }

  update(updates: { title?: string; description?: string; eventDate?: Date }): Event {
    return new Event({
      ...this,
      ...updates,
      updatedAt: new Date(),
    })
  }

  isFinished(): boolean {
    return this.eventDate < new Date()
  }
}
