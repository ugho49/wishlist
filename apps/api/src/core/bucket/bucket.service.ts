import type { WishlistId } from '@wishlist/common';

import { getLogger } from '@znight/observability';

export abstract class BucketService {
  protected readonly logger = getLogger(BucketService.name);

  protected constructor(type: 'mock' | 'real') {
    this.logger.info(`Using ${type} implementation`);
  }

  abstract removeIfExist(param: { destination: string }): Promise<void>;
  abstract upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string>;
  abstract uploadFile(param: { destination: string; file: File }): Promise<string>;

  public getLogoDestination(wishlistId: WishlistId) {
    return `pictures/wishlists/${wishlistId}/logo`;
  }
}
