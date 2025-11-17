import type {
  AddCoOwnerInputDto,
  CreateWishlistInputDto,
  DetailedWishlistDto,
  GetPaginationQueryDto,
  LinkUnlinkWishlistInputDto,
  MiniWishlistDto,
  PagedResponse,
  UpdateWishlistInputDto,
  UpdateWishlistLogoOutputDto,
  WishlistId,
  WishlistWithEventsDto,
} from '@wishlist/common'
import type { AxiosInstance } from 'axios'
import type { CommonRequestOptions } from './common'

export class WishlistService {
  constructor(private readonly client: AxiosInstance) {}

  getAll(params: GetPaginationQueryDto, options?: CommonRequestOptions): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.client.get('/wishlist', { params, signal: options?.signal }).then(res => res.data)
  }

  getById(wishlistId: WishlistId, options?: CommonRequestOptions): Promise<DetailedWishlistDto> {
    return this.client.get(`/wishlist/${wishlistId}`, { signal: options?.signal }).then(res => res.data)
  }

  create(data: CreateWishlistInputDto, file?: File): Promise<MiniWishlistDto> {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))
    if (file !== undefined) {
      formData.append('image', file)
    }

    return this.client
      .post('/wishlist', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data)
  }

  async update(wishlistId: WishlistId, data: UpdateWishlistInputDto): Promise<void> {
    await this.client.put(`/wishlist/${wishlistId}`, data)
  }

  async delete(wishlistId: WishlistId): Promise<void> {
    await this.client.delete(`/wishlist/${wishlistId}`)
  }

  async linkWishlistToAnEvent(wishlistId: WishlistId, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.client.post(`/wishlist/${wishlistId}/link-event`, data)
  }

  async unlinkWishlistToAnEvent(wishlistId: WishlistId, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.client.post(`/wishlist/${wishlistId}/unlink-event`, data)
  }

  uploadLogo(wishlistId: WishlistId, file: File): Promise<UpdateWishlistLogoOutputDto> {
    const formData = new FormData()
    formData.append('file', file)

    return this.client
      .post(`/wishlist/${wishlistId}/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(res => res.data)
  }

  async removeLogo(wishlistId: WishlistId): Promise<void> {
    await this.client.delete(`/wishlist/${wishlistId}/logo`)
  }

  async addCoOwner(wishlistId: WishlistId, data: AddCoOwnerInputDto): Promise<void> {
    await this.client.post(`/wishlist/${wishlistId}/co-owner`, data)
  }

  async removeCoOwner(wishlistId: WishlistId): Promise<void> {
    await this.client.delete(`/wishlist/${wishlistId}/co-owner`)
  }
}
