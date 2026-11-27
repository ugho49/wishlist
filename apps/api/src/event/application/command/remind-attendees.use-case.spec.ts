import type { AttendeeId } from '@wishlist/common';
import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { uuid } from '@wishlist/common';
import { EventPublisher } from '@znight/events';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@znight/http';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { User } from '../../../user/domain/model/user.model';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { AttendeeRemindedEvent } from '../../domain/event/attendee-reminded.event';
import { Event } from '../../domain/model/event.model';
import { EventAttendee } from '../../domain/model/event-attendee.model';
import { RemindAttendeesUseCase } from './remind-attendees.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

const byText = (left: string, right: string) => left.localeCompare(right);

describe('RemindAttendeesUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const userRepository = createMock<UserRepository>();
  const transactionManager = createMock<TransactionManager>();
  const eventBus = createMock<EventPublisher>();
  const rateLimiter = createMock<RateLimiter>();
  const rateLimitConfig = new RateLimitConfig();

  let useCase: RemindAttendeesUseCase;
  let creator: User;
  let participant: User;
  let event: Event;

  const attendeeOf = (user: User): EventAttendee => {
    const attendee = event.attendees.find(a => a.user?.id === user.id);
    if (!attendee) throw new Error('attendee not found');
    return attendee;
  };

  const pendingAttendee = (): EventAttendee => {
    const attendee = event.attendees.find(a => a.isTemporaryAttendee());
    if (!attendee) throw new Error('pending attendee not found');
    return attendee;
  };

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder()
      .withCreator(creator)
      .withAttendee(participant)
      .withPendingAttendee('pending@test.fr')
      .build();

    eventRepository.findByIdOrFail.mockResolvedValue(event);
    wishlistRepository.findFilledByEventIds.mockResolvedValue([]);
    userRepository.findByIdOrFail.mockResolvedValue(creator);
    rateLimiter.consume.mockResolvedValue(undefined);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new RemindAttendeesUseCase(
      eventRepository,
      attendeeRepository,
      wishlistRepository,
      userRepository,
      transactionManager,
      eventBus,
      rateLimiter,
      rateLimitConfig,
    );
  });

  describe('authorization', () => {
    it('should reject when the current user is a simple participant', async () => {
      await expect(
        useCase.execute({
          currentUser: toCurrentUser(participant),
          eventId: event.id,
          attendeeIds: [pendingAttendee().id],
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(attendeeRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should reject when the current user is not an attendee', async () => {
      const stranger = new UserBuilder().withEmail('stranger@test.fr').build();

      await expect(
        useCase.execute({
          currentUser: toCurrentUser(stranger),
          eventId: event.id,
          attendeeIds: [pendingAttendee().id],
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should let an admin of the event remind attendees', async () => {
      const admin = new UserBuilder().withEmail('admin@test.fr').build();
      event = new EventBuilder()
        .withCreator(creator)
        .withAttendee(admin, AttendeeRole.ADMIN)
        .withPendingAttendee('pending@test.fr')
        .build();
      eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

      const { remindedAttendees } = await useCase.execute({
        currentUser: toCurrentUser(admin),
        eventId: event.id,
        attendeeIds: [pendingAttendee().id],
      });

      expect(remindedAttendees.map(a => a.id)).toEqual([pendingAttendee().id]);
    });
  });

  it('should reject when the event is finished', async () => {
    event = new EventBuilder().withCreator(creator).withPendingAttendee('pending@test.fr').finished().build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id, attendeeIds: [pendingAttendee().id] }),
    ).rejects.toThrow(BadRequestException);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when an attendee is not part of the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeIds: [pendingAttendee().id, uuid() as AttendeeId],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should remind the selected attendees without a filled wishlist', async () => {
    const { remindedAttendees } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeIds: [attendeeOf(participant).id, pendingAttendee().id],
    });

    expect(remindedAttendees.map(a => a.id).toSorted(byText)).toEqual(
      [attendeeOf(participant).id, pendingAttendee().id].toSorted(byText),
    );
    expect(remindedAttendees.every(a => a.lastRemindedAt instanceof Date)).toBe(true);
    expect(wishlistRepository.findFilledByEventIds).toHaveBeenCalledWith([event.id]);
    expect(rateLimiter.consume).toHaveBeenCalledWith(
      [expect.objectContaining({ key: `invitation:user:${creator.id}` })],
      2,
    );
    expect(attendeeRepository.save).toHaveBeenCalledTimes(2);
    expect(attendeeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: pendingAttendee().id, lastRemindedAt: expect.any(Date) }),
      undefined,
    );
    expect(eventBus.publish).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new AttendeeRemindedEvent({
        event,
        attendee: remindedAttendees.find(a => a.id === pendingAttendee().id) as EventAttendee,
        remindedBy: creator,
      }),
    );
  });

  it('should remind an attendee only once when selected twice', async () => {
    const { remindedAttendees } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeIds: [pendingAttendee().id, pendingAttendee().id],
    });

    expect(remindedAttendees).toHaveLength(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });

  describe('skipped attendees', () => {
    it('should skip the attendees who filled their wishlist', async () => {
      wishlistRepository.findFilledByEventIds.mockResolvedValueOnce([
        new WishlistBuilder().withOwner(participant).withEventIds([event.id]).build(),
      ]);

      const { remindedAttendees } = await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeIds: [attendeeOf(participant).id, pendingAttendee().id],
      });

      expect(remindedAttendees.map(a => a.id)).toEqual([pendingAttendee().id]);
      expect(rateLimiter.consume).toHaveBeenCalledWith(expect.any(Array), 1);
    });

    it('should skip the current user', async () => {
      const { remindedAttendees } = await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeIds: [attendeeOf(creator).id, pendingAttendee().id],
      });

      expect(remindedAttendees.map(a => a.id)).toEqual([pendingAttendee().id]);
    });

    it('should skip the attendees reminded too recently', async () => {
      const recentlyReminded = pendingAttendee().remind(new Date(Date.now() - 60_000));
      event = new Event({
        ...event,
        attendees: event.attendees.map(a => (a.id === recentlyReminded.id ? recentlyReminded : a)),
      });
      eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

      const { remindedAttendees } = await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeIds: [attendeeOf(participant).id, recentlyReminded.id],
      });

      expect(remindedAttendees.map(a => a.id)).toEqual([attendeeOf(participant).id]);
    });

    it('should neither consume the quota nor save when nobody is left to remind', async () => {
      const { remindedAttendees } = await useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeIds: [attendeeOf(creator).id],
      });

      expect(remindedAttendees).toEqual([]);
      expect(rateLimiter.consume).not.toHaveBeenCalled();
      expect(attendeeRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });

  it('should neither save nor email when the daily quota is reached', async () => {
    rateLimiter.consume.mockRejectedValueOnce(new BusinessRuleException('RATE_LIMITED', 'Too many requests'));

    await expect(
      useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id, attendeeIds: [pendingAttendee().id] }),
    ).rejects.toThrow(BusinessRuleException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
