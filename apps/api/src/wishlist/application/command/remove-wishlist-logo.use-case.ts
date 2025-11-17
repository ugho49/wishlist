import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { RemoveWishlistLogoCommand, WishlistRepository } from '../../domain'

@CommandHandler(RemoveWishlistLogoCommand)
export class RemoveWishlistLogoUseCase implements IInferredCommandHandler<RemoveWishlistLogoCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveWishlistLogoCommand): Promise<void> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId)
    await this.bucketService.removeIfExist({ destination })

    const updatedWishlist = wishlist.updateLogoUrl(undefined)

    await this.wishlistRepository.save(updatedWishlist)
  }
}
