import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { DeleteWishlistCommand, WishlistRepository } from '../../domain'

@CommandHandler(DeleteWishlistCommand)
export class DeleteWishlistUseCase implements IInferredCommandHandler<DeleteWishlistCommand> {
  private readonly logger = new Logger(DeleteWishlistUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: DeleteWishlistCommand): Promise<void> {
    this.logger.log('Delete wishlist request received', { command })
    const { currentUser, wishlistId } = command

    // 1. Find wishlist and check permissions
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    const userCanDeleteList = wishlist.isOwnerOrCoOwner(currentUser.id) || currentUser.isAdmin

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can delete it')
    }

    // 2. Delete wishlist
    this.logger.log('Deleting wishlist...', { wishlistId })
    await this.wishlistRepository.delete(wishlistId)

    // 3. Clean up logo from bucket if exists
    const logoDest = this.bucketService.getLogoDestination(wishlistId)
    this.logger.log('Removing logo from bucket...', { wishlistId, logoDest })
    await this.bucketService.removeIfExist({ destination: logoDest })
  }
}
