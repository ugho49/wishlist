import type { WishlistMessageDto } from '@wishlist/common'
import type { WishlistMessage } from '../domain'

import { userMapper } from '@wishlist/api/user'

function toDto(message: WishlistMessage): WishlistMessageDto {
  return {
    id: message.id,
    content: message.content,
    author: userMapper.toMiniUserDto(message.author),
    created_at: message.createdAt.toISOString(),
  }
}

export const wishlistMessageMapper = {
  toDto,
}
