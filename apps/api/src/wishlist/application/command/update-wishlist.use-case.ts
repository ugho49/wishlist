import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { WISHLIST_REPOSITORY } from '@wishlist/api/repositories'

import { UpdateWishlistCommand, WishlistRepository } from '../../domain'

@CommandHandler(UpdateWishlistCommand)
export class UpdateWishlistUseCase implements IInferredCommandHandler<UpdateWishlistCommand> {
  constructor(@Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository) {}

  async execute(command: UpdateWishlistCommand): Promise<void> {
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const updatedWishlist = wishlist.update({
      title: command.updateWishlist.title,
      description: command.updateWishlist.description,
    })

    await this.wishlistRepository.save(updatedWishlist)
  }
}
