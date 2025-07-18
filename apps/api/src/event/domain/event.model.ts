import type { Attendee } from '@wishlist/api/attendee'
import type { EventId, ICurrentUser, UserId, WishlistId } from '@wishlist/common'

import { AttendeeRole } from '@wishlist/common'

export type EventProps = {
  id: EventId
  title: string
  description?: string
  eventDate: Date
  attendees: Attendee[]
  wishlistIds: WishlistId[]
  createdAt: Date
  updatedAt: Date
}

export class Event {
  public readonly id: EventId
  public readonly title: string
  public readonly description?: string
  public readonly eventDate: Date
  public readonly attendees: Attendee[]
  public readonly wishlistIds: WishlistId[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: EventProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.eventDate = props.eventDate
    this.attendees = props.attendees
    this.wishlistIds = props.wishlistIds
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
      wishlistIds: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  update(updates: { title: string; description?: string; eventDate: Date }): Event {
    return new Event({
      ...this,
      ...updates,
      updatedAt: new Date(),
    })
  }

  isFinished(): boolean {
    return this.eventDate < new Date()
  }

  canEdit(currentUser: ICurrentUser): boolean {
    return this.canAccessByRole({
      currentUser,
      acceptedRoles: [AttendeeRole.MAINTAINER],
    })
  }

  canView(currentUser: ICurrentUser): boolean {
    return this.canAccessByRole({
      currentUser,
      acceptedRoles: [AttendeeRole.MAINTAINER, AttendeeRole.USER],
    })
  }

  canAddWishlist(currentUserId: UserId): boolean {
    return this.attendees.some(a => a.user?.id === currentUserId)
  }

  private canAccessByRole(params: { currentUser: ICurrentUser; acceptedRoles: AttendeeRole[] }): boolean {
    const { currentUser, acceptedRoles } = params
    if (currentUser.isAdmin) return true
    const attendee = this.attendees.find(a => a.user?.id === currentUser.id)
    if (!attendee) return false
    return acceptedRoles.includes(attendee.role)
  }
}
