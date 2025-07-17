import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { AttendeeRepository } from '@wishlist/api/attendee'
import { Event } from '@wishlist/api/event'
import { ATTENDEE_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { MAX_EVENTS_BY_LIST } from '@wishlist/common'

import { LinkWishlistToEventCommand, WishlistRepository } from '../../domain'

@CommandHandler(LinkWishlistToEventCommand)
export class LinkWishlistToEventUseCase implements IInferredCommandHandler<LinkWishlistToEventCommand> {
  constructor(
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: AttendeeRepository,
  ) {}

  async execute(command: LinkWishlistToEventCommand): Promise<void> {
    const { currentUser, wishlistId, eventId } = command

    // 1. Find wishlist and check ownership
    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId)

    if (!wishlist.isOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner of the list can update it')
    }

    // 2. Check if wishlist already has max events
    if (wishlist.eventIds.length >= MAX_EVENTS_BY_LIST) {
      throw new UnauthorizedException(`You cannot link your list to more than ${MAX_EVENTS_BY_LIST} events`)
    }

    // 3. Check if already linked
    if (wishlist.eventIds.includes(eventId)) {
      throw new BadRequestException('Wishlist is already linked to this event')
    }

    // 4. Find event and check user access
    const eventAttendees = await this.attendeeRepository.findByEventId(eventId)

    if (!Event.canView({ currentUser, attendees: eventAttendees })) {
      throw new UnauthorizedException('You cannot add the wishlist to this event')
    }

    // 5. Link wishlist to event
    const updatedWishlist = wishlist.linkEvent(eventId)
    await this.wishlistRepository.save(updatedWishlist)
  }
}
