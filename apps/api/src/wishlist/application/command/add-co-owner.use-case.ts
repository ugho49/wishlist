import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'

import { AddCoOwnerCommand, WishlistRepository } from '../../domain'

@CommandHandler(AddCoOwnerCommand)
export class AddCoOwnerUseCase implements IInferredCommandHandler<AddCoOwnerCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(command: AddCoOwnerCommand): Promise<void> {
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

    await this.wishlistRepository.save(updatedWishlist)
  }
}
