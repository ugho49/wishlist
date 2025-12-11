import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UploadWishlistLogoCommand, UploadWishlistLogoResult, WishlistRepository } from '../../domain'

@CommandHandler(UploadWishlistLogoCommand)
export class UploadWishlistLogoUseCase implements IInferredCommandHandler<UploadWishlistLogoCommand> {
  private readonly logger = new Logger(UploadWishlistLogoUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: UploadWishlistLogoCommand): Promise<UploadWishlistLogoResult> {
    this.logger.log('Upload wishlist logo request received', { command })
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId)

    try {
      this.logger.log('Removing existing logo from bucket...', { wishlistId: command.wishlistId, destination })
      await this.bucketService.removeIfExist({ destination })
    } catch (e) {
      this.logger.error('Fail to delete existing logo for wishlist', wishlist.id, e)
    }

    this.logger.log('Uploading new logo to bucket...', { wishlistId: command.wishlistId, destination })
    const newLogoUrl = await this.bucketService.uploadFile({
      destination,
      file: command.file,
    })

    const updatedWishlist = wishlist.updateLogoUrl(newLogoUrl)

    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['logoUrl'] })
    await this.wishlistRepository.save(updatedWishlist)

    return { logo_url: newLogoUrl }
  }
}
