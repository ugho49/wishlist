import type { GetAllWishlistsPaginationQueryDto, PagedResponse, UserDto } from '@wishlist/common-types'
import type { AxiosInstance } from 'axios'

import type { CommonRequestOptions } from './common'

export class AdminWishlistService {
  constructor(private readonly client: AxiosInstance) {}

  getAll(params: GetAllWishlistsPaginationQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<UserDto>> {
    return this.client.get(`/admin/wishlist`, { params, signal: options?.signal }).then(res => res.data)
  }
}
