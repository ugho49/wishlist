import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, WishlistMessageId } from '@wishlist/common'

import { WishlistMessageRepository } from '../../domain'

export type DeleteWishlistMessageInput = {
  currentUser: ICurrentUser
  messageId: WishlistMessageId
}

@Injectable()
export class DeleteWishlistMessageUseCase {
  private readonly logger = new Logger(DeleteWishlistMessageUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_MESSAGE) private readonly wishlistMessageRepository: WishlistMessageRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(input: DeleteWishlistMessageInput): Promise<void> {
    this.logger.log('Delete wishlist message request received', { messageId: input.messageId })

    const message = await this.wishlistMessageRepository.findByIdOrFail(input.messageId)

    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: message.wishlistId,
      userId: input.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    // Only the author can delete their own message
    if (!message.isAuthor(input.currentUser.id)) {
      throw new UnauthorizedException('You can only delete your own messages')
    }

    await this.wishlistMessageRepository.delete(input.messageId)
  }
}
