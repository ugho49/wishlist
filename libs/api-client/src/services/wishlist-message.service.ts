import type { CreateWishlistMessageInputDto, WishlistId, WishlistMessageDto, WishlistMessageId } from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class WishlistMessageService {
  constructor(private readonly client: AxiosInstance) {}

  getMessages(wishlistId: WishlistId, options?: CommonRequestOptions): Promise<WishlistMessageDto[]> {
    return this.client
      .get('/wishlist-message', { params: { wishlistId }, signal: options?.signal })
      .then(res => res.data)
  }

  create(data: CreateWishlistMessageInputDto): Promise<WishlistMessageDto> {
    return this.client.post('/wishlist-message', data).then(res => res.data)
  }

  async delete(messageId: WishlistMessageId): Promise<void> {
    await this.client.delete(`/wishlist-message/${messageId}`)
  }
}
