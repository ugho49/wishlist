import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { UnlinkWishlistFromEventCommand, WishlistRepository } from '../../domain'

@CommandHandler(UnlinkWishlistFromEventCommand)
export class UnlinkWishlistFromEventUseCase implements IInferredCommandHandler<UnlinkWishlistFromEventCommand> {
  private readonly logger = new Logger(UnlinkWishlistFromEventUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(command: UnlinkWishlistFromEventCommand): Promise<void> {
    this.logger.log('Unlink wishlist from event request received', { command })
    const { currentUser, wishlistId, eventId } = command

    // 1. Find wishlist and check ownership
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwnerOrCoOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can update it')
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
    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['eventIds'] })
    await this.wishlistRepository.save(updatedWishlist)
  }
}
