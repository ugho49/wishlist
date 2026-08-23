import type { EventBus } from '@nestjs/cqrs';
import type { AttendeeId } from '@wishlist/common';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { AttendeeAddedEvent } from '../../domain/event/attendee-added.event';
import { Event } from '../../domain/model/event.model';
import { AddAttendeeUseCase } from './add-attendee.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AddAttendeeUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const userRepository = createMock<UserRepository>();
  const eventBus = createMock<EventBus>();

  let useCase: AddAttendeeUseCase;
  let creator: User;
  let event: Event;
  let attendeeId: AttendeeId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    event = new EventBuilder().withCreator(creator).build();
    attendeeId = uuid() as AttendeeId;

    eventRepository.findByIdOrFail.mockResolvedValue(event);
    attendeeRepository.newId.mockReturnValue(attendeeId);
    userRepository.findByEmail.mockResolvedValue(undefined);
    userRepository.findByIdOrFail.mockResolvedValue(creator);

    useCase = new AddAttendeeUseCase(eventRepository, attendeeRepository, userRepository, eventBus);
  });

  it('should reject when the current user cannot edit the event', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        eventId: event.id,
        newAttendee: { email: 'invite@test.fr' },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the attendee already exists', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        newAttendee: { email: creator.email },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when assigning the creator role', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        newAttendee: { email: 'invite@test.fr', role: AttendeeRole.CREATOR },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should add an existing user as attendee and publish an event', async () => {
    const invitee = new UserBuilder().withEmail('invite@test.fr').build();
    userRepository.findByEmail.mockResolvedValueOnce(invitee);

    const { attendee } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      newAttendee: { email: invitee.email, role: AttendeeRole.ADMIN },
    });

    expect(attendee.id).toBe(attendeeId);
    expect(attendee.user?.id).toBe(invitee.id);
    expect(attendee.role).toBe(AttendeeRole.ADMIN);
    expect(attendeeRepository.save).toHaveBeenCalledWith(attendee);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(AttendeeAddedEvent);
  });

  it('should add a pending attendee when the email is unknown', async () => {
    const { attendee } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      newAttendee: { email: 'pending@test.fr' },
    });

    expect(attendee.user).toBeUndefined();
    expect(attendee.pendingEmail).toBe('pending@test.fr');
    expect(attendee.role).toBe(AttendeeRole.PARTICIPANT);
    expect(attendeeRepository.save).toHaveBeenCalledWith(attendee);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });
});
