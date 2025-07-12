import type { AttendeeRole, EventId } from '@wishlist/common'

import { AttendeeRole as Role, uuid } from '@wishlist/common'

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

  canEdit(currentUser: { isAdmin: boolean }, userRole?: AttendeeRole): boolean {
    if (currentUser.isAdmin) return true
    return userRole === Role.MAINTAINER
  }

  update(updates: { title?: string; description?: string; eventDate?: Date }): Event {
    return new Event({
      ...this,
      ...updates,
      updatedAt: new Date(),
    })
  }
}
