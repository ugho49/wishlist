import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';

export type DeleteEventInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
};

@Injectable()
export class DeleteEventUseCase {
  private readonly logger = getLogger(DeleteEventUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(input: DeleteEventInput): Promise<void> {
    this.logger.info('Delete event request received', { input });
    const { currentUser, eventId } = input;

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can delete it');
    }

    const wishlists = await this.wishlistRepository.findByEvent(event.id);

    if (wishlists.length > 0) {
      throw new BadRequestException('Event has wishlists, cannot delete it');
    }

    await this.transactionManager.runInTransaction(async tx => {
      this.logger.info('Deleting attendees...', { eventId });
      for (const attendee of event.attendees) {
        await this.attendeeRepository.delete(attendee.id, tx);
      }

      this.logger.info('Deleting event...', { eventId });
      await this.eventRepository.delete(event.id, tx);
    });
  }
}
