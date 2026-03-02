import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { CursorPaginatedWishlistMessagesDto, ICurrentUser, WishlistId } from '@wishlist/common'

import { WishlistMessageRepository } from '../../domain'
import { decodeCursor, encodeCursor } from '../../infrastructure/wishlist-message.cursor'
import { wishlistMessageMapper } from '../../infrastructure/wishlist-message.mapper'

const DEFAULT_LIMIT = 20

export type GetWishlistMessagesInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
  cursor?: string
  limit?: number
}

@Injectable()
export class GetWishlistMessagesUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_MESSAGE) private readonly wishlistMessageRepository: WishlistMessageRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: GetWishlistMessagesInput): Promise<CursorPaginatedWishlistMessagesDto> {
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: input.wishlistId,
      userId: input.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId)

    // Same visibility rule as item sensitive info: owner/co-owner cannot see messages when hideItems is true
    if (!wishlist.canDisplayItemSensitiveInformations(input.currentUser.id)) {
      return { messages: [], unread_count: 0 }
    }

    const lastReadAt = await this.wishlistMessageRepository.getLastReadAt({
      userId: input.currentUser.id,
      wishlistId: input.wishlistId,
    })

    const unreadCount = await this.wishlistMessageRepository.countUnreadMessages({
      wishlistId: input.wishlistId,
      lastReadAt,
    })

    const limit = input.limit ?? DEFAULT_LIMIT

    // If limit is 0, only return the unread count (lightweight request for badge)
    if (limit === 0) {
      return { messages: [], unread_count: unreadCount }
    }

    const cursor = input.cursor ? decodeCursor(input.cursor) : undefined

    // Messages come back in DESC order (newest first)
    const messages = await this.wishlistMessageRepository.findByWishlistIdPaginated({
      wishlistId: input.wishlistId,
      cursor,
      limit,
    })

    // Build next_cursor from the oldest message in the batch (last element since ordered DESC)
    const oldestMessage = messages.length === limit ? messages[messages.length - 1] : undefined
    const nextCursor = oldestMessage ? encodeCursor(oldestMessage.createdAt, oldestMessage.id) : undefined

    // Reverse to chronological order (oldest first) for display
    const chronologicalMessages = [...messages].reverse()

    return {
      messages: chronologicalMessages.map(wishlistMessageMapper.toDto),
      next_cursor: nextCursor,
      unread_count: unreadCount,
    }
  }
}
