import type { WishlistItemRepository } from '../../../item/domain/wishlist-item.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type AttendeeId, type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { ConflictException, NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';

export type DeleteAttendeeInput = {
  currentUser: ICurrentUser;
  attendeeId: AttendeeId;
  eventId: EventId;
};

@Injectable()
export class DeleteAttendeeUseCase {
  private readonly logger = getLogger(DeleteAttendeeUseCase.name);

  constructor(
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly eventRepository: EventRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly itemRepository: WishlistItemRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: DeleteAttendeeInput): Promise<void> {
    this.logger.info('Delete attendee request received', { input });
    const { attendeeId, currentUser, eventId } = input;

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can delete an attendee');
    }

    const attendee = event.attendees.find(a => a.id === attendeeId);

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    if (attendee.user?.id === currentUser.id) {
      throw new ConflictException('You cannot delete yourself from the event');
    }

    if (attendee.isCreator()) {
      throw new ConflictException('You cannot delete the creator of the event');
    }

    const attendeeUserId = attendee.user?.id;

    const attendeeWishlistsForEvent =
      attendeeUserId === undefined
        ? []
        : (await this.wishlistRepository.findByEvent(attendee.eventId)).filter(wishlist =>
            wishlist.isOwner(attendeeUserId),
          );

    await this.transactionManager.runInTransaction(async tx => {
      this.logger.info('Removing attendee from event...', { attendeeId, eventId });
      // Remove the attendee from the event
      await this.attendeeRepository.delete(attendeeId, tx);

      this.logger.info('Checking wishlists where the attendee is the owner...', { eventId, attendeeId });
      // Check if this is ok for the wishlists
      for (const wishlist of attendeeWishlistsForEvent) {
        if (wishlist.eventIds.length > 1) {
          this.logger.info('Unlinking event from wishlist...', { wishlistId: wishlist.id, eventId: attendee.eventId });
          const updatedWishlist = wishlist.unlinkEvent(attendee.eventId);
          await this.wishlistRepository.save(updatedWishlist, tx);
          continue;
        }

        if (wishlist.eventIds.length === 1) {
          this.logger.info('Checking if the wishlist has items...', { wishlistId: wishlist.id });
          const items = await this.itemRepository.findByWishlist(wishlist.id);

          if (items.length > 0) {
            this.logger.info('The wishlist has items...', { wishlistId: wishlist.id });
            throw new ConflictException(
              'You cannot remove this attendee from the event because he have a list in this event and the list have only this event attached',
            );
          }
        }

        this.logger.info('Deleting wishlist...', { wishlistId: wishlist.id });
        await this.wishlistRepository.delete(wishlist.id, tx);
      }
    });
  }
}
