import type { AttendeeId, EventId } from '@wishlist/common';
import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { User } from '../../../user/domain/model/user.model';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { Event } from '../../domain/model/event.model';
import type { EventAttendee } from '../../domain/model/event-attendee.model';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { ConflictException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { DeleteAttendeeUseCase } from './delete-attendee.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

function attendeeForUser(event: Event, user: User): EventAttendee {
  const attendee = event.attendees.find(a => a.user?.id === user.id);
  if (attendee === undefined) {
    throw new Error(`Missing attendee for ${user.email}`);
  }
  return attendee;
}

function creatorAttendeeOf(event: Event): EventAttendee {
  const attendee = event.attendees.find(a => a.isCreator());
  if (attendee === undefined) {
    throw new Error('Missing creator attendee');
  }
  return attendee;
}

function pendingAttendeeOf(event: Event, email: string): EventAttendee {
  const attendee = event.attendees.find(a => a.pendingEmail === email);
  if (attendee === undefined) {
    throw new Error(`Missing pending attendee ${email}`);
  }
  return attendee;
}

describe('DeleteAttendeeUseCase', () => {
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const eventRepository = createMock<EventRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: DeleteAttendeeUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let participantAttendee: EventAttendee;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    participantAttendee = attendeeForUser(event, participant);

    eventRepository.findByIdOrFail.mockResolvedValue(event);
    wishlistRepository.findByEvent.mockResolvedValue([]);
    transactionManager.runInTransaction.mockImplementation(async fn => fn({} as never));

    useCase = new DeleteAttendeeUseCase(attendeeRepository, eventRepository, wishlistRepository, transactionManager);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(attendeeRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when the attendee is not found', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: uuid() as AttendeeId,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(attendeeRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when deleting yourself', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(admin, AttendeeRole.ADMIN).build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        eventId: event.id,
        attendeeId: attendeeForUser(event, admin).id,
      }),
    ).rejects.toThrow(ConflictException);
    expect(attendeeRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when deleting the creator', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(admin, AttendeeRole.ADMIN).build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        eventId: event.id,
        attendeeId: creatorAttendeeOf(event).id,
      }),
    ).rejects.toThrow(ConflictException);
    expect(attendeeRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when the attendee wishlist has only this event and items', async () => {
    const wishlist = new Wishlist({
      ...new WishlistBuilder().withOwner(participant).withEventIds([event.id]).build(),
      items: [new WishlistItemBuilder().build()],
    });
    wishlistRepository.findByEvent.mockResolvedValueOnce([wishlist]);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      }),
    ).rejects.toThrow(ConflictException);
    expect(wishlistRepository.delete).not.toHaveBeenCalled();
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should unlink the event when the attendee wishlist is linked to multiple events', async () => {
    const otherEventId = uuid() as EventId;
    const wishlist = new WishlistBuilder().withOwner(participant).withEventIds([event.id, otherEventId]).build();
    wishlistRepository.findByEvent.mockResolvedValueOnce([wishlist]);

    await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeId: participantAttendee.id,
    });

    expect(attendeeRepository.delete).toHaveBeenCalledWith(participantAttendee.id, expect.anything());
    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.eventIds).toEqual([otherEventId]);
    expect(wishlistRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete the wishlist when it has only this event and no items', async () => {
    const wishlist = new WishlistBuilder().withOwner(participant).withEventIds([event.id]).build();
    wishlistRepository.findByEvent.mockResolvedValueOnce([wishlist]);

    await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeId: participantAttendee.id,
    });

    expect(attendeeRepository.delete).toHaveBeenCalledWith(participantAttendee.id, expect.anything());
    expect(wishlistRepository.delete).toHaveBeenCalledWith(wishlist.id, expect.anything());
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should delete a pending attendee without touching wishlists', async () => {
    event = new EventBuilder().withCreator(creator).withPendingAttendee('pending@test.fr').build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);
    const pendingAttendee = pendingAttendeeOf(event, 'pending@test.fr');

    await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeId: pendingAttendee.id,
    });

    expect(wishlistRepository.findByEvent).not.toHaveBeenCalled();
    expect(attendeeRepository.delete).toHaveBeenCalledWith(pendingAttendee.id, expect.anything());
    expect(wishlistRepository.delete).not.toHaveBeenCalled();
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });
});
