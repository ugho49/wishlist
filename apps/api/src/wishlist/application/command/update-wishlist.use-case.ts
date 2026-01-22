import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { ICurrentUser, WishlistId } from '@wishlist/common'

import { WishlistRepository } from '../../domain'

export type UpdateWishlistInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
  updateWishlist: {
    title: string
    description?: string
  }
}

@Injectable()
export class UpdateWishlistUseCase {
  private readonly logger = new Logger(UpdateWishlistUseCase.name)

  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(command: UpdateWishlistInput): Promise<void> {
    this.logger.log('Update wishlist request received', { command })
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    if (!wishlist.isOwnerOrCoOwner(command.currentUser.id)) {
      throw new UnauthorizedException('You cannot modify this wishlist')
    }

    const updatedWishlist = wishlist.update({
      title: command.updateWishlist.title,
      description: command.updateWishlist.description,
    })

    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['title', 'description'] })
    await this.wishlistRepository.save(updatedWishlist)
  }
}
