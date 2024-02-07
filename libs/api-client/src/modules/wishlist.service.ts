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
import { ServiceConstructor } from '../modules.type';

export class WishlistService {
  private getClient: ServiceConstructor['getClient'];

  constructor(params: ServiceConstructor) {
    this.getClient = params.getClient;
  }

  getAll(params: GetPaginationQueryDto): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.getClient()
      .get('/wishlist', { params })
      .then((res) => res.data);
  }

  getById(wishlistId: string): Promise<DetailedWishlistDto> {
    return this.getClient()
      .get(`/wishlist/${wishlistId}`)
      .then((res) => res.data);
  }

  create(data: CreateWishlistInputDto): Promise<MiniWishlistDto> {
    return this.getClient()
      .post('/wishlist', data)
      .then((res) => res.data);
  }

  async update(wishlistId: string, data: UpdateWishlistInputDto): Promise<void> {
    await this.getClient()
      .put(`/wishlist/${wishlistId}`, data)
      .then((res) => res.data);
  }

  async delete(wishlistId: string): Promise<void> {
    await this.getClient()
      .delete(`/wishlist/${wishlistId}`)
      .then((res) => res.data);
  }

  async linkWishlistToAnEvent(wishlistId: string, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.getClient()
      .post(`/wishlist/${wishlistId}/link-event`, data)
      .then((res) => res.data);
  }

  async unlinkWishlistToAnEvent(wishlistId: string, data: LinkUnlinkWishlistInputDto): Promise<void> {
    await this.getClient()
      .post(`/wishlist/${wishlistId}/unlink-event`, data)
      .then((res) => res.data);
  }

  async uploadLogo(wishlistId: string, file: File): Promise<UpdateWishlistLogoOutputDto> {
    const formData = new FormData();
    formData.append('file', file);

    return this.getClient()
      .post(`/wishlist/${wishlistId}/upload-logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  }

  async removeLogo(wishlistId: string): Promise<void> {
    await this.getClient()
      .delete(`/wishlist/${wishlistId}/logo`)
      .then((res) => res.data);
  }
}
