import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, WishlistId, WishlistMessageDto } from '@wishlist/common'

import { WishlistMessageRepository } from '../../domain'
import { wishlistMessageMapper } from '../../infrastructure/wishlist-message.mapper'

export type GetWishlistMessagesInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
}

@Injectable()
export class GetWishlistMessagesUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST_MESSAGE) private readonly wishlistMessageRepository: WishlistMessageRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: GetWishlistMessagesInput): Promise<WishlistMessageDto[]> {
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: input.wishlistId,
      userId: input.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId)

    // Same visibility rule as item sensitive info: owner/co-owner cannot see messages when hideItems is true
    if (!wishlist.canDisplayItemSensitiveInformations(input.currentUser.id)) {
      return []
    }

    const messages = await this.wishlistMessageRepository.findByWishlistId(input.wishlistId)

    return messages.map(wishlistMessageMapper.toDto)
  }
}
