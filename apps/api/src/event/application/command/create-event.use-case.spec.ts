import type { AttendeeId, EventId } from '@wishlist/common';
import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { uuid } from '@wishlist/common';
import { EventPublisher } from '@znight/events';
import { BadRequestException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { User } from '../../../user/domain/model/user.model';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { AttendeeAddedEvent } from '../../domain/event/attendee-added.event';
import { CreateEventUseCase } from './create-event.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateEventUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const userRepository = createMock<UserRepository>();
  const eventBus = createMock<EventPublisher>();
  const rateLimiter = createMock<RateLimiter>();
  const rateLimitConfig = new RateLimitConfig();

  let useCase: CreateEventUseCase;
  let creator: User;
  let eventId: EventId;

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    eventId = uuid() as EventId;

    eventRepository.newId.mockReturnValue(eventId);
    attendeeRepository.newId.mockImplementation(() => uuid() as AttendeeId);
    userRepository.findByEmails.mockResolvedValue([]);
    userRepository.findByIdOrFail.mockResolvedValue(creator);
    rateLimiter.consume.mockResolvedValue(undefined);

    useCase = new CreateEventUseCase(
      eventRepository,
      attendeeRepository,
      userRepository,
      eventBus,
      rateLimiter,
      rateLimitConfig,
    );
  });

  it('should reject when assigning the creator role to an invited attendee', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        newEvent: {
          title: 'Anniversaire',
          eventDate: new Date(Date.now() + 86_400_000),
          attendees: [{ email: 'invite@test.fr', role: AttendeeRole.CREATOR }],
        },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(rateLimiter.consume).not.toHaveBeenCalled();
    expect(eventRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should not create the event when the invitation quota of the current user is reached', async () => {
    rateLimiter.consume.mockRejectedValueOnce(new BusinessRuleException('RATE_LIMITED', 'Too many requests'));

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        newEvent: {
          title: 'Anniversaire',
          eventDate: new Date(Date.now() + 86_400_000),
          attendees: [{ email: 'invite@test.fr' }],
        },
      }),
    ).rejects.toThrow(BusinessRuleException);
    expect(userRepository.findByEmails).not.toHaveBeenCalled();
    expect(eventRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should count each invited email once against the invitation quota, never the creator', async () => {
    const { event } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      newEvent: {
        title: 'Anniversaire',
        eventDate: new Date(Date.now() + 86_400_000),
        attendees: [
          { email: 'pending@test.fr' },
          { email: 'pending@test.fr', role: AttendeeRole.ADMIN },
          { email: creator.email },
          { email: 'other@test.fr' },
        ],
      },
    });

    expect(rateLimiter.consume).toHaveBeenCalledWith(
      [{ key: `invitation:user:${creator.id}`, limit: rateLimitConfig.invitationsPerUser, windowSeconds: 86_400 }],
      2,
    );
    expect(userRepository.findByEmails).toHaveBeenCalledWith(['pending@test.fr', 'other@test.fr']);
    expect(event.attendees.map(a => a.pendingEmail ?? a.user?.email).sort()).toEqual(
      [creator.email, 'pending@test.fr', 'other@test.fr'].sort(),
    );
    expect(event.attendees.find(a => a.pendingEmail === 'pending@test.fr')?.role).toBe(AttendeeRole.PARTICIPANT);
    expect(eventBus.publish).toHaveBeenCalledTimes(2);
  });

  it('should create the event with the current user as creator and publish nothing', async () => {
    const { event } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      newEvent: {
        title: 'Anniversaire',
        description: 'Une fête',
        icon: '🎂',
        eventDate: new Date(Date.now() + 86_400_000),
      },
    });

    expect(event.id).toBe(eventId);
    expect(event.title).toBe('Anniversaire');
    expect(event.attendees).toHaveLength(1);
    expect(event.attendees[0]?.user?.id).toBe(creator.id);
    expect(event.attendees[0]?.role).toBe(AttendeeRole.CREATOR);
    expect(eventRepository.save).toHaveBeenCalledWith(event);
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should add an existing user as attendee and publish an event', async () => {
    const invitee = new UserBuilder().withEmail('invite@test.fr').build();
    userRepository.findByEmails.mockResolvedValueOnce([invitee]);

    const { event } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      newEvent: {
        title: 'Anniversaire',
        eventDate: new Date(Date.now() + 86_400_000),
        attendees: [{ email: invitee.email, role: AttendeeRole.ADMIN }],
      },
    });

    const invitedAttendee = event.attendees.find(a => a.user?.id === invitee.id);
    expect(invitedAttendee?.role).toBe(AttendeeRole.ADMIN);
    expect(event.attendees).toHaveLength(2);
    expect(eventRepository.save).toHaveBeenCalledWith(event);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(AttendeeAddedEvent);
  });

  it('should add a pending attendee when the email is unknown', async () => {
    const { event } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      newEvent: {
        title: 'Anniversaire',
        eventDate: new Date(Date.now() + 86_400_000),
        attendees: [{ email: 'pending@test.fr' }],
      },
    });

    const pendingAttendee = event.attendees.find(a => a.pendingEmail === 'pending@test.fr');
    expect(pendingAttendee?.user).toBeUndefined();
    expect(pendingAttendee?.role).toBe(AttendeeRole.PARTICIPANT);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(AttendeeAddedEvent);
  });
});
