import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { RemoveWishlistLogoCommand, WishlistRepository } from '../../domain'

@CommandHandler(RemoveWishlistLogoCommand)
export class RemoveWishlistLogoUseCase implements IInferredCommandHandler<RemoveWishlistLogoCommand> {
  private readonly logger = new Logger(RemoveWishlistLogoUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: RemoveWishlistLogoCommand): Promise<void> {
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
