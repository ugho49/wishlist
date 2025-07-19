import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { MAX_EVENTS_BY_LIST } from '@wishlist/common'

import { LinkWishlistToEventCommand, WishlistRepository } from '../../domain'

@CommandHandler(LinkWishlistToEventCommand)
export class LinkWishlistToEventUseCase implements IInferredCommandHandler<LinkWishlistToEventCommand> {
  constructor(
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: LinkWishlistToEventCommand): Promise<void> {
    const { currentUser, wishlistId, eventId } = command

    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner of the list can update it')
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
    await this.wishlistRepository.save(updatedWishlist)
  }
}
