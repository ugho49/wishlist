import {
  type CreateWishlistInputDto,
  type DetailedWishlistDto,
  type GetPaginationQueryDto,
  type LinkUnlinkWishlistInputDto,
  type MiniWishlistDto,
  type PagedResponse,
  type UpdateWishlistInputDto,
  type UpdateWishlistLogoOutputDto,
  type WishlistWithEventsDto,
} from '@wishlist/common-types';
import AxiosInstance from 'xior';

export class WishlistService {
  constructor(private readonly client: AxiosInstance) {}

  getAll(params: GetPaginationQueryDto): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.client.get('/wishlist', { params }).then((res) => res.data);
  }

  getById(wishlistId: string): Promise<DetailedWishlistDto> {
    return this.client.get(`/wishlist/${wishlistId}`).then((res) => res.data);
  }

  create(data: CreateWishlistInputDto, file?: File): Promise<MiniWishlistDto> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (file !== undefined) {
      formData.append('image', file);
    }

    return this.client
      .post('/wishlist', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  }

  async update(wishlistId: string, data: UpdateWishlistInputDto): Promise<void> {
    await this.client.put(`/wishlist/${wishlistId}`, data).then((res) => res.data);
  }

  async delete(wishlistId: string): Promise<void> {
    await this.client.delete(`/wishlist/${wishlistId}`).then((res) => res.data);
  }

  async linkWishlistToAnEvent(wishlistId: string, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.client.post(`/wishlist/${wishlistId}/link-event`, data).then((res) => res.data);
  }

  async unlinkWishlistToAnEvent(wishlistId: string, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.client.post(`/wishlist/${wishlistId}/unlink-event`, data).then((res) => res.data);
  }

  async uploadLogo(wishlistId: string, file: File): Promise<UpdateWishlistLogoOutputDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client
      .post(`/wishlist/${wishlistId}/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  }

  async removeLogo(wishlistId: string): Promise<void> {
    await this.client.delete(`/wishlist/${wishlistId}/logo`).then((res) => res.data);
  }
}
