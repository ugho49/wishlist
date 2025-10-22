import type { User } from '@wishlist/api/user'
import type { ItemId, UserId, WishlistId } from '@wishlist/common'

export type WishlistItemProps = {
  id: ItemId
  importSourceId?: ItemId
  wishlistId: WishlistId
  name: string
  description?: string
  url?: string
  score?: number
  isSuggested: boolean
  imageUrl?: string
  takenBy?: User
  takenAt?: Date
  createdAt: Date
  updatedAt: Date
}

export class WishlistItem {
  public readonly id: ItemId
  public readonly importSourceId?: ItemId
  public readonly wishlistId: WishlistId
  public readonly name: string
  public readonly description?: string
  public readonly url?: string
  public readonly score?: number
  public readonly isSuggested: boolean
  public readonly imageUrl?: string
  public readonly takenBy?: User
  public readonly takenAt?: Date
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: WishlistItemProps) {
    this.id = props.id
    this.importSourceId = props.importSourceId
    this.wishlistId = props.wishlistId
    this.name = props.name
    this.description = props.description
    this.url = props.url
    this.score = props.score
    this.isSuggested = props.isSuggested
    this.imageUrl = props.imageUrl
    this.takenBy = props.takenBy
    this.takenAt = props.takenAt
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: ItemId
    name: string
    description?: string
    url?: string
    score?: number
    isSuggested: boolean
    imageUrl?: string
    wishlistId: WishlistId
    importSourceId?: ItemId
    takenBy?: User
    takenAt?: Date
  }): WishlistItem {
    const now = new Date()

    return new WishlistItem({
      id: params.id,
      wishlistId: params.wishlistId,
      name: params.name,
      description: params.description,
      url: params.url,
      score: params.score,
      isSuggested: params.isSuggested,
      imageUrl: params.imageUrl,
      importSourceId: params.importSourceId,
      takenBy: params.takenBy,
      takenAt: params.takenAt,
      createdAt: now,
      updatedAt: now,
    })
  }

  convertToSuggested(): WishlistItem {
    return new WishlistItem({
      ...this,
      isSuggested: true,
    })
  }

  exportTo(params: { id: ItemId; wishlistId: WishlistId }): WishlistItem {
    if (this.isSuggested) {
      throw new Error('You cannot export a suggested item')
    }

    const now = new Date()

    return new WishlistItem({
      id: params.id,
      wishlistId: params.wishlistId,
      name: this.name,
      description: this.description,
      url: this.url,
      score: this.score,
      isSuggested: false,
      imageUrl: this.imageUrl,
      importSourceId: this.id,
      createdAt: now,
      updatedAt: now,
    })
  }

  update(params: {
    name?: string
    description?: string
    url?: string
    imageUrl?: string
    score?: number
  }): WishlistItem {
    return new WishlistItem({ ...this, ...params, updatedAt: new Date() })
  }

  isTakenBySomeone() {
    return this.takenBy !== undefined
  }

  isTakenBy(userId: UserId) {
    return this.takenBy?.id === userId
  }

  check(user: User): WishlistItem {
    return new WishlistItem({
      ...this,
      takenBy: user,
      takenAt: new Date(),
      updatedAt: new Date(),
    })
  }

  uncheck(): WishlistItem {
    return new WishlistItem({
      ...this,
      takenBy: undefined,
      takenAt: undefined,
      updatedAt: new Date(),
    })
  }
}
