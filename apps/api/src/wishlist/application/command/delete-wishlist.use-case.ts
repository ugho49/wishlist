import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { DeleteWishlistCommand, WishlistRepository } from '../../domain'

@CommandHandler(DeleteWishlistCommand)
export class DeleteWishlistUseCase implements IInferredCommandHandler<DeleteWishlistCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: DeleteWishlistCommand): Promise<void> {
    const { currentUser, wishlistId } = command

    // 1. Find wishlist and check permissions
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    const userCanDeleteList = wishlist.isOwnerOrCoOwner(currentUser.id) || currentUser.isAdmin

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can delete it')
    }

    // 2. Delete wishlist
    await this.wishlistRepository.delete(wishlistId)

    // 3. Clean up logo from bucket if exists
    const logoDest = this.bucketService.getLogoDestination(wishlistId)
    await this.bucketService.removeIfExist({ destination: logoDest })
  }
}
