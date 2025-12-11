import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { MAX_EVENTS_BY_LIST } from '@wishlist/common'

import { LinkWishlistToEventCommand, WishlistRepository } from '../../domain'

@CommandHandler(LinkWishlistToEventCommand)
export class LinkWishlistToEventUseCase implements IInferredCommandHandler<LinkWishlistToEventCommand> {
  private readonly logger = new Logger(LinkWishlistToEventUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: LinkWishlistToEventCommand): Promise<void> {
    this.logger.log('Link wishlist to event request received', { command })
    const { currentUser, wishlistId, eventId } = command

    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwnerOrCoOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can update it')
    }

    const event = await this.eventRepository.findByIdOrFail(eventId)

    if (!event.canAddWishlist(currentUser.id)) {
      throw new UnauthorizedException('You cannot add the wishlist to this event')
    }

    if (wishlist.eventIds.length >= MAX_EVENTS_BY_LIST) {
      throw new UnauthorizedException(`You cannot link your list to more than ${MAX_EVENTS_BY_LIST} events`)
    }

    if (wishlist.isLinkedToEvent(eventId)) {
      throw new BadRequestException('Wishlist is already linked to this event')
    }

    const updatedWishlist = wishlist.linkEvent(eventId)

    this.logger.log('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['eventIds'] })
    await this.wishlistRepository.save(updatedWishlist)
  }
}
