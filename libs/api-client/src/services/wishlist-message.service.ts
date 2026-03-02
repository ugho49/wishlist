import type {
  CreateWishlistMessageInputDto,
  CursorPaginatedWishlistMessagesDto,
  MarkWishlistMessagesAsReadInputDto,
  WishlistId,
  WishlistMessageDto,
  WishlistMessageId,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class WishlistMessageService {
  constructor(private readonly client: AxiosInstance) {}

  getMessages(
    params: { wishlistId: WishlistId; cursor?: string; limit?: number },
    options?: CommonRequestOptions,
  ): Promise<CursorPaginatedWishlistMessagesDto> {
    return this.client
      .get('/wishlist-message', {
        params: { wishlistId: params.wishlistId, cursor: params.cursor, limit: params.limit },
        signal: options?.signal,
      })
      .then(res => res.data)
  }

  create(data: CreateWishlistMessageInputDto): Promise<WishlistMessageDto> {
    return this.client.post('/wishlist-message', data).then(res => res.data)
  }

  async markAsRead(data: MarkWishlistMessagesAsReadInputDto): Promise<void> {
    await this.client.put('/wishlist-message/read', data)
  }

  async delete(messageId: WishlistMessageId): Promise<void> {
    await this.client.delete(`/wishlist-message/${messageId}`)
  }
}
