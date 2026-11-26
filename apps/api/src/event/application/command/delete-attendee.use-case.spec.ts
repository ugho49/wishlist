import type { AttendeeId, EventId } from '@wishlist/common';
import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { WishlistItemRepository } from '../../../item/domain/wishlist-item.repository';
import type { SecretSantaRepository } from '../../../secret-santa/domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../../secret-santa/domain/repository/secret-santa-user.repository';
import type { User } from '../../../user/domain/model/user.model';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { Event } from '../../domain/model/event.model';
import type { EventAttendee } from '../../domain/model/event-attendee.model';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { uuid } from '@wishlist/common';
import { ConflictException, NotFoundException, UnauthorizedException } from '@znight/http';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { DeleteAttendeeUseCase } from './delete-attendee.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

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
  const itemRepository = createMock<WishlistItemRepository>();
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const transactionManager = createMock<TransactionManager>();
  const tx = {} as never;

  let useCase: DeleteAttendeeUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let participantAttendee: EventAttendee;

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    participantAttendee = attendeeForUser(event, participant);

    eventRepository.findByIdOrFail.mockResolvedValue(event);
    wishlistRepository.findByEvent.mockResolvedValue([]);
    itemRepository.findByWishlist.mockResolvedValue([]);
    secretSantaRepository.findForEvent.mockResolvedValue(undefined);
    transactionManager.runInTransaction.mockImplementation(async fn => fn(tx));

    useCase = new DeleteAttendeeUseCase(
      attendeeRepository,
      eventRepository,
      wishlistRepository,
      itemRepository,
      secretSantaRepository,
      secretSantaUserRepository,
      transactionManager,
    );
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
    const wishlist = new WishlistBuilder().withOwner(participant).withEventIds([event.id]).build();
    wishlistRepository.findByEvent.mockResolvedValueOnce([wishlist]);
    itemRepository.findByWishlist.mockResolvedValueOnce([
      new WishlistItemBuilder().withWishlistId(wishlist.id).build(),
    ]);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      }),
    ).rejects.toThrow(ConflictException);
    expect(itemRepository.findByWishlist).toHaveBeenCalledWith(wishlist.id);
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
    expect(itemRepository.findByWishlist).not.toHaveBeenCalled();
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
    expect(itemRepository.findByWishlist).toHaveBeenCalledWith(wishlist.id);
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

  describe('when the event has a secret santa', () => {
    it('should take the attendee out of a secret santa whose draw has not started, before removing them', async () => {
      const participation = new SecretSantaUserBuilder().withAttendeeId(participantAttendee.id).build();
      const otherParticipation = new SecretSantaUserBuilder().withAttendeeId(creatorAttendeeOf(event).id).build();
      const secretSanta = new SecretSantaBuilder()
        .withEventId(event.id)
        .withUsers([participation, otherParticipation])
        .build();
      secretSantaRepository.findForEvent.mockResolvedValueOnce(secretSanta);

      await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      });

      expect(secretSantaRepository.findForEvent).toHaveBeenCalledWith({ eventId: event.id });
      expect(secretSantaUserRepository.delete).toHaveBeenCalledTimes(1);
      expect(secretSantaUserRepository.delete).toHaveBeenCalledWith(participation.id, tx);
      expect(attendeeRepository.delete).toHaveBeenCalledWith(participantAttendee.id, tx);
      const [participationDeletion] = secretSantaUserRepository.delete.mock.invocationCallOrder;
      const [attendeeDeletion] = attendeeRepository.delete.mock.invocationCallOrder;
      expect(participationDeletion).toBeLessThan(attendeeDeletion as number);
    });

    it('should not touch a secret santa the attendee does not take part in', async () => {
      const otherParticipation = new SecretSantaUserBuilder().withAttendeeId(creatorAttendeeOf(event).id).build();
      const secretSanta = new SecretSantaBuilder().withEventId(event.id).withUsers([otherParticipation]).build();
      secretSantaRepository.findForEvent.mockResolvedValueOnce(secretSanta);

      await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      });

      expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
      expect(attendeeRepository.delete).toHaveBeenCalledWith(participantAttendee.id, tx);
    });

    it('should remove an attendee who does not take part in a secret santa whose draw has started', async () => {
      const otherParticipation = new SecretSantaUserBuilder().withAttendeeId(creatorAttendeeOf(event).id).build();
      const secretSanta = new SecretSantaBuilder()
        .withEventId(event.id)
        .withUsers([otherParticipation])
        .started()
        .build();
      secretSantaRepository.findForEvent.mockResolvedValueOnce(secretSanta);

      await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      });

      expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
      expect(attendeeRepository.delete).toHaveBeenCalledWith(participantAttendee.id, tx);
    });

    it('should refuse with a business rule when the attendee takes part in a secret santa whose draw has started', async () => {
      const participation = new SecretSantaUserBuilder().withAttendeeId(participantAttendee.id).build();
      const secretSanta = new SecretSantaBuilder().withEventId(event.id).withUsers([participation]).started().build();
      secretSantaRepository.findForEvent.mockResolvedValueOnce(secretSanta);

      const execution = useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
      });

      await expect(execution).rejects.toThrow(BusinessRuleException);
      await expect(execution).rejects.toMatchObject({ code: 'USER_IN_STARTED_SECRET_SANTA' });
      expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
      expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
      expect(attendeeRepository.delete).not.toHaveBeenCalled();
    });
  });
});
