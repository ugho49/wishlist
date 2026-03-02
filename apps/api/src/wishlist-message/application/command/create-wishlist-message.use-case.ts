import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { WishlistRepository } from '@wishlist/api/wishlist'
import { ICurrentUser, WishlistId, WishlistMessageDto } from '@wishlist/common'

import { WishlistMessage, WishlistMessageRepository } from '../../domain'
import { wishlistMessageMapper } from '../../infrastructure/wishlist-message.mapper'

export type CreateWishlistMessageInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
  content: string
}

@Injectable()
export class CreateWishlistMessageUseCase {
  private readonly logger = new Logger(CreateWishlistMessageUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST_MESSAGE) private readonly wishlistMessageRepository: WishlistMessageRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateWishlistMessageInput): Promise<WishlistMessageDto> {
    this.logger.log('Create wishlist message request received', { wishlistId: input.wishlistId })

    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: input.wishlistId,
      userId: input.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId)

    // Same visibility rule as item toggle: owner/co-owner cannot add messages when hideItems is true
    if (wishlist.isOwnerOrCoOwner(input.currentUser.id) && wishlist.hideItems) {
      throw new UnauthorizedException('You cannot add messages to your own wishlist')
    }

    const user = await this.userRepository.findByIdOrFail(input.currentUser.id)

    const message = WishlistMessage.create({
      id: this.wishlistMessageRepository.newId(),
      wishlistId: input.wishlistId,
      author: user,
      content: input.content,
    })

    await this.wishlistMessageRepository.save(message)

    return wishlistMessageMapper.toDto(message)
  }
}
