import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UnlinkWishlistFromEventCommand, WishlistRepository } from '../../domain'

@CommandHandler(UnlinkWishlistFromEventCommand)
export class UnlinkWishlistFromEventUseCase implements IInferredCommandHandler<UnlinkWishlistFromEventCommand> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(command: UnlinkWishlistFromEventCommand): Promise<void> {
    const { currentUser, wishlistId, eventId } = command

    // 1. Find wishlist and check ownership
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner of the list can update it')
    }

    // 2. Check if wishlist is linked to this event
    if (!wishlist.isLinkedToEvent(eventId)) {
      throw new BadRequestException('Wishlist is not linked to this event')
    }

    // 3. Check if wishlist has at least 2 events (must keep at least one)
    if (wishlist.eventIds.length === 1) {
      throw new BadRequestException('A wishlist must be linked to at least one event. Delete the wishlist instead.')
    }

    // 4. Unlink wishlist from event
    const updatedWishlist = wishlist.unlinkEvent(eventId)
    await this.wishlistRepository.save(updatedWishlist)
  }
}
