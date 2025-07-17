import type { WishlistItem } from '@wishlist/api/item'
import type { User } from '@wishlist/api/user'
import type { EventId, WishlistId } from '@wishlist/common'

import { uuid } from '@wishlist/common'

export type WishlistProps = {
  id: WishlistId
  title: string
  description?: string
  owner: User
  hideItems: boolean
  logoUrl?: string
  eventIds: EventId[]
  items: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export class Wishlist {
  public readonly id: WishlistId
  public readonly title: string
  public readonly description?: string
  public readonly owner: User
  public readonly hideItems: boolean
  public readonly logoUrl?: string
  public readonly eventIds: EventId[]
  public readonly items: WishlistItem[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: WishlistProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.owner = props.owner
    this.hideItems = props.hideItems
    this.items = props.items
    this.logoUrl = props.logoUrl
    this.eventIds = props.eventIds
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    title: string
    eventIds: EventId[]
    description?: string
    owner: User
    hideItems: boolean
    items: WishlistItem[]
    logoUrl?: string
  }): Wishlist {
    const now = new Date()

    return new Wishlist({
      id: uuid() as WishlistId,
      title: params.title,
      description: params.description,
      owner: params.owner,
      hideItems: params.hideItems,
      logoUrl: params.logoUrl,
      eventIds: params.eventIds,
      items: params.items,
      createdAt: now,
      updatedAt: now,
    })
  }

  linkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: [...this.eventIds, eventId],
    })
  }

  unlinkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: this.eventIds.filter(id => id !== eventId),
    })
  }
}
