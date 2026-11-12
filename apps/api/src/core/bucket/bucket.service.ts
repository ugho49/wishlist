import type { WishlistId } from '@wishlist/common';

export abstract class BucketService {
  abstract removeIfExist(param: { destination: string }): Promise<void>;
  abstract upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string>;
  abstract uploadFile(param: { destination: string; file: File }): Promise<string>;

  public getLogoDestination(wishlistId: WishlistId) {
    return `pictures/wishlists/${wishlistId}/logo`;
  }
}
