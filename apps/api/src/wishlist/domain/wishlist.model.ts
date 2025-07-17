import type { User } from '@wishlist/api/user'
import type { WishlistId } from '@wishlist/common'

import { uuid } from '@wishlist/common'

export type WishlistProps = {
  id: WishlistId
  title: string
  description?: string
  owner: User
  hideItems: boolean
  logoUrl?: string
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
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: WishlistProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.owner = props.owner
    this.hideItems = props.hideItems
    this.logoUrl = props.logoUrl
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    title: string
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
      createdAt: now,
      updatedAt: now,
    })
  }
}
