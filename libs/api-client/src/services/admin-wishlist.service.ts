import type { GetAllWishlistsPaginationQueryDto, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class AdminWishlistService {
  constructor(private readonly client: AxiosInstance) {}

  getAll(
    params: GetAllWishlistsPaginationQueryDto,
    options?: CommonRequestOptions,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.client.get(`/admin/wishlist`, { params, signal: options?.signal }).then(res => res.data)
  }
}
