import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { RemoveCoOwnerCommand, WishlistRepository } from '../../domain'

@CommandHandler(RemoveCoOwnerCommand)
export class RemoveCoOwnerUseCase implements IInferredCommandHandler<RemoveCoOwnerCommand> {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(command: RemoveCoOwnerCommand): Promise<void> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    // Only the owner can remove the co-owner
    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('Only the owner can remove the co-owner')
    }

    const updatedWishlist = wishlist.removeCoOwner()

    await this.wishlistRepository.save(updatedWishlist)
  }
}
