import { BadRequestException, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { EventBus } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { ICurrentUser, UserId, WishlistId } from '@wishlist/common'

import { UserAddedAsCoOwnerToWishlistEvent, WishlistRepository } from '../../domain'

export type AddCoOwnerInput = {
  currentUser: ICurrentUser
  wishlistId: WishlistId
  coOwnerId: UserId
}

@Injectable()
export class AddCoOwnerUseCase {
  private readonly logger = new Logger(AddCoOwnerUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddCoOwnerInput): Promise<void> {
    this.logger.log('Add co-owner request received', { command })
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId)

    // Only the owner can add a co-owner
    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('Only the owner can add a co-owner')
    }

    // Cannot add co-owner to private lists
    if (wishlist.hideItems) {
      throw new BadRequestException('Cannot add co-owner to private lists')
    }

    // Cannot add the owner as co-owner
    if (wishlist.isOwner(command.coOwnerId)) {
      throw new BadRequestException('Cannot add the owner as co-owner')
    }

    // Fetch the co-owner user
    const coOwner = await this.userRepository.findByIdOrFail(command.coOwnerId)

    const updatedWishlist = wishlist.addCoOwner(coOwner)

    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['coOwner'] })
    await this.wishlistRepository.save(updatedWishlist)

    await this.eventBus.publish(new UserAddedAsCoOwnerToWishlistEvent({ wishlist: updatedWishlist }))
  }
}
