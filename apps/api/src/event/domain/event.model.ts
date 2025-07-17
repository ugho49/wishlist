import type { Attendee } from '@wishlist/api/attendee'
import type { EventId, ICurrentUser } from '@wishlist/common'

import { AttendeeRole, uuid } from '@wishlist/common'

export type EventProps = {
  id: EventId
  title: string
  description?: string
  eventDate: Date
  createdAt: Date
  updatedAt: Date
}

export class Event {
  public readonly id: EventId
  public readonly title: string
  public readonly description?: string
  public readonly eventDate: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: EventProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.eventDate = props.eventDate
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(param: { title: string; description?: string; eventDate: Date }): Event {
    const now = new Date()
    return new Event({
      id: uuid() as EventId,
      title: param.title,
      description: param.description,
      eventDate: param.eventDate,
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
