import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type EventId, type ICurrentUser, MAX_EVENTS_BY_LIST, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type EventRepository } from '../../../event/domain/repository/event.repository';

export type LinkWishlistToEventInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  eventId: EventId;
};

@Injectable()
export class LinkWishlistToEventUseCase {
  private readonly logger = getLogger(LinkWishlistToEventUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(command: LinkWishlistToEventInput): Promise<void> {
    this.logger.info('Link wishlist to event request received', { command });
    const { currentUser, wishlistId, eventId } = command;

    const wishlist = await this.wishlistRepository.findByIdOrFail(wishlistId);

    if (!wishlist.isOwnerOrCoOwner(currentUser.id)) {
      throw new UnauthorizedException('Only the owner or co-owner of the list can update it');
    }

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canAddWishlist(currentUser.id)) {
      throw new UnauthorizedException('You cannot add the wishlist to this event');
    }

    if (wishlist.eventIds.length >= MAX_EVENTS_BY_LIST) {
      throw new UnauthorizedException(`You cannot link your list to more than ${MAX_EVENTS_BY_LIST} events`);
    }

    if (wishlist.isLinkedToEvent(eventId)) {
      throw new BadRequestException('Wishlist is already linked to this event');
    }

    const updatedWishlist = wishlist.linkEvent(eventId);

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['eventIds'] });
    await this.wishlistRepository.save(updatedWishlist);
  }
}
