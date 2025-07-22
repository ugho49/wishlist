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
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const destination = this.bucketService.getLogoDestination(command.wishlistId)

    try {
      await this.bucketService.removeIfExist({ destination })
    } catch (e) {
      this.logger.error('Fail to delete existing logo for wishlist', wishlist.id, e)
    }

    const newLogoUrl = await this.bucketService.uploadFile({
      destination,
      file: command.file,
    })

    const updatedWishlist = wishlist.updateLogoUrl(newLogoUrl)

    await this.wishlistRepository.save(updatedWishlist)

    return { logo_url: newLogoUrl }
  }
}
