import type { AttendeeId } from '@wishlist/common';
import type { User } from '../../../user/domain/model/user.model';
import type { Event } from '../../domain/model/event.model';
import type { EventAttendee } from '../../domain/model/event-attendee.model';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { UpdateAttendeeRoleUseCase } from './update-attendee-role.use-case';
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

describe('UpdateAttendeeRoleUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();

  let useCase: UpdateAttendeeRoleUseCase;
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

    useCase = new UpdateAttendeeRoleUseCase(eventRepository, attendeeRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        eventId: event.id,
        attendeeId: participantAttendee.id,
        role: AttendeeRole.ADMIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the attendee is not found', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: uuid() as AttendeeId,
        role: AttendeeRole.ADMIN,
      }),
    ).rejects.toThrow(NotFoundException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when changing your own role', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(admin, AttendeeRole.ADMIN).build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        eventId: event.id,
        attendeeId: attendeeForUser(event, admin).id,
        role: AttendeeRole.PARTICIPANT,
      }),
    ).rejects.toThrow(ConflictException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when changing the creator role', async () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(admin, AttendeeRole.ADMIN).build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(admin),
        eventId: event.id,
        attendeeId: creatorAttendeeOf(event).id,
        role: AttendeeRole.ADMIN,
      }),
    ).rejects.toThrow(ConflictException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when assigning the creator role', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
        role: AttendeeRole.CREATOR,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the role is not admin or participant', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        eventId: event.id,
        attendeeId: participantAttendee.id,
        role: 'unknown' as AttendeeRole,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(attendeeRepository.save).not.toHaveBeenCalled();
  });

  it('should update the attendee role', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      attendeeId: participantAttendee.id,
      role: AttendeeRole.ADMIN,
    });

    expect(attendeeRepository.save).toHaveBeenCalledTimes(1);
    const savedAttendee = attendeeRepository.save.mock.calls[0]?.[0];
    expect(savedAttendee?.id).toBe(participantAttendee.id);
    expect(savedAttendee?.role).toBe(AttendeeRole.ADMIN);
  });
});
