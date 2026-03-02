import type { User } from '@wishlist/api/user'
import type { UserId, WishlistId, WishlistMessageId } from '@wishlist/common'

export type WishlistMessageProps = {
  id: WishlistMessageId
  wishlistId: WishlistId
  author: User
  content: string
  createdAt: Date
  updatedAt: Date
}

export class WishlistMessage {
  public readonly id: WishlistMessageId
  public readonly wishlistId: WishlistId
  public readonly author: User
  public readonly content: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: WishlistMessageProps) {
    this.id = props.id
    this.wishlistId = props.wishlistId
    this.author = props.author
    this.content = props.content
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: WishlistMessageId
    wishlistId: WishlistId
    author: User
    content: string
  }): WishlistMessage {
    const now = new Date()
    return new WishlistMessage({
      id: params.id,
      wishlistId: params.wishlistId,
      author: params.author,
      content: params.content,
      createdAt: now,
      updatedAt: now,
    })
  }

  isAuthor(userId: UserId): boolean {
    return this.author.id === userId
  }
}
