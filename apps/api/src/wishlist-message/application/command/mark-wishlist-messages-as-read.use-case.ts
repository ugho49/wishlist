import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, WishlistId } from '@wishlist/common'

import { WishlistMessageRepository } from '../../domain'

export type MarkWishlistMessagesAsReadInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
}

@Injectable()
export class MarkWishlistMessagesAsReadUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_MESSAGE) private readonly wishlistMessageRepository: WishlistMessageRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: MarkWishlistMessagesAsReadInput): Promise<void> {
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: input.wishlistId,
      userId: input.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId)

    // Same visibility rule: owner/co-owner cannot interact with messages when hideItems is true
    if (!wishlist.canDisplayItemSensitiveInformations(input.currentUser.id)) {
      return
    }

    await this.wishlistMessageRepository.markAsRead({
      userId: input.currentUser.id,
      wishlistId: input.wishlistId,
    })
  }
}
