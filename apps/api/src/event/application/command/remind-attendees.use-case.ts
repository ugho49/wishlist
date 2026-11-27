import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type AttendeeId, type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { TransactionManager } from '../../../core/database/transaction-manager';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { AttendeeRemindedEvent } from '../../domain/event/attendee-reminded.event';
import { EventAttendee } from '../../domain/model/event-attendee.model';
import { invitationRateLimitRule } from '../invitation-rate-limit';

export type RemindAttendeesInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
  attendeeIds: AttendeeId[];
};

export type RemindAttendeesOutput = {
  remindedAttendees: EventAttendee[];
};

/**
 * Emails the selected attendees who have not filled their wishlist yet. The attendees who filled it in the meantime,
 * were reminded too recently, or are the current user are skipped: the output only holds the reminded ones.
 */
@Injectable()
export class RemindAttendeesUseCase {
  private readonly logger = getLogger(RemindAttendeesUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly wishlistRepository: WishlistRepository,
    private readonly userRepository: UserRepository,
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventPublisher,
    private readonly rateLimiter: RateLimiter,
    private readonly rateLimitConfig: RateLimitConfig,
  ) {}

  async execute(input: RemindAttendeesInput): Promise<RemindAttendeesOutput> {
    const { currentUser, eventId } = input;
    this.logger.info('Remind attendees request received', { eventId, currentUser });

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can remind attendees');
    }

    if (event.isFinished()) {
      throw new BadRequestException('Event is already finished');
    }

    const selectedAttendees = [...new Set(input.attendeeIds)].map(attendeeId => {
      const attendee = event.attendees.find(a => a.id === attendeeId);
      if (!attendee) throw new NotFoundException('Attendee not found');
      return attendee;
    });

    const filledWishlists = await this.wishlistRepository.findFilledByEventIds([event.id]);
    const attendeeIdsWithoutWishlist = new Set(event.attendeesWithoutWishlist(filledWishlists).map(a => a.id));
    const now = new Date();

    const attendeesToRemind = selectedAttendees.filter(
      attendee =>
        attendeeIdsWithoutWishlist.has(attendee.id) &&
        attendee.user?.id !== currentUser.id &&
        attendee.canBeRemindedAt(now),
    );

    if (attendeesToRemind.length === 0) {
      this.logger.info('No attendee to remind', { eventId });
      return { remindedAttendees: [] };
    }

    // Every reminder is an email to any address: it counts against the same daily quota as the invitations.
    await this.rateLimiter.consume(
      [invitationRateLimitRule(currentUser.id, this.rateLimitConfig)],
      attendeesToRemind.length,
    );

    const remindedAttendees = attendeesToRemind.map(attendee => attendee.remind(now));

    this.logger.info('Saving reminded attendees...', { eventId, attendeeIds: remindedAttendees.map(a => a.id) });
    await this.transactionManager.runInTransaction(async tx => {
      for (const attendee of remindedAttendees) {
        await this.attendeeRepository.save(attendee, tx);
      }
    });

    const remindedBy = await this.userRepository.findByIdOrFail(currentUser.id);

    for (const attendee of remindedAttendees) {
      await this.eventBus.publish(new AttendeeRemindedEvent({ event, attendee, remindedBy }));
    }

    return { remindedAttendees };
  }
}
