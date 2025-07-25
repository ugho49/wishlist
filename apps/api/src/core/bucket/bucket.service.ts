import type { WishlistId } from '@wishlist/common'

import { Logger } from '@nestjs/common'

export abstract class BucketService {
  protected readonly logger = new Logger(BucketService.name)

  protected constructor(type: 'mock' | 'real') {
    this.logger.log(`Using ${type} implementation`)
  }

  abstract removeIfExist(param: { destination: string }): Promise<void>
  abstract upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string>
  abstract uploadFile(param: { destination: string; file: Express.Multer.File }): Promise<string>

  public getLogoDestination(wishlistId: WishlistId) {
    return `pictures/wishlists/${wishlistId}/logo`
  }
}
