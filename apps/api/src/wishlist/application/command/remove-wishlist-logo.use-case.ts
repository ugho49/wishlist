import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, WishlistId } from '@wishlist/common'

import { WishlistRepository } from '../../domain'

export type RemoveWishlistLogoInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
}

@Injectable()
export class RemoveWishlistLogoUseCase {
  private readonly logger = new Logger(RemoveWishlistLogoUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveWishlistLogoInput): Promise<void> {
    this.logger.log('Remove wishlist logo request received', { command })
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId)
    this.logger.log('Removing logo from bucket...', { wishlistId: command.wishlistId, destination })
    await this.bucketService.removeIfExist({ destination })

    const updatedWishlist = wishlist.updateLogoUrl(undefined)

    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['logoUrl'] })
    await this.wishlistRepository.save(updatedWishlist)
  }
}
