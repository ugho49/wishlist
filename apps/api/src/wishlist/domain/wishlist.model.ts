import type { WishlistItem } from '@wishlist/api/item'
import type { User } from '@wishlist/api/user'
import type { EventId, UserId, WishlistId } from '@wishlist/common'

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
      items: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  update(params: { title: string; description?: string }) {
    return new Wishlist({
      ...this,
      title: params.title,
      description: params.description,
      updatedAt: new Date(),
    })
  }

  updateLogoUrl(logoUrl?: string) {
    return new Wishlist({
      ...this,
      logoUrl,
      updatedAt: new Date(),
    })
  }

  isLinkedToEvent(id: EventId): boolean {
    return this.eventIds.includes(id)
  }

  linkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: [...this.eventIds, eventId],
      updatedAt: new Date(),
    })
  }

  unlinkEvent(eventId: EventId) {
    return new Wishlist({
      ...this,
      eventIds: this.eventIds.filter(id => id !== eventId),
      updatedAt: new Date(),
    })
  }

  isOwner(userId: UserId) {
    return this.owner.id === userId
  }

  isListHiddingItems(): boolean {
    return this.hideItems
  }

  canDisplayItemSensitiveInformations(currentUserId: UserId): boolean {
    // If hideItems is false, we want to display all items, including suggested and with the taker
    if (!this.isListHiddingItems()) return true

    // If we are the owner of the list, we not want the information to be displayed
    return !this.isOwner(currentUserId)
  }

  getItemsToDisplay(currentUserId: UserId): WishlistItem[] {
    return this.items.filter(item => this.canShowItem({ item, currentUserId }))
  }

  private canShowItem(params: { item: WishlistItem; currentUserId: UserId }): boolean {
    const { item, currentUserId } = params

    // If hideItems is false, we force items to be shown, even if they are suggested
    if (!this.isListHiddingItems()) return true

    // If we are not the owner of the list, display all items
    if (!this.isOwner(currentUserId)) return true

    // In this case, current user is owner of the list
    // we want to show him only the item that are not suggested
    return !item.isSuggested
  }
}
