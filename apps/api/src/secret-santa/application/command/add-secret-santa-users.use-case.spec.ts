import type { AttendeeId, SecretSantaUserId } from '@wishlist/common';
import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { AddSecretSantaUsersUseCase } from './add-secret-santa-users.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AddSecretSantaUsersUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: AddSecretSantaUsersUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let santa: SecretSanta;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    santa = new SecretSantaBuilder().withEventId(event.id).build();

    secretSantaRepository.findByIdOrFail.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);
    secretSantaUserRepository.newId.mockImplementation(() => uuid() as SecretSantaUserId);

    useCase = new AddSecretSantaUsersUseCase(secretSantaRepository, secretSantaUserRepository, eventRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        secretSantaId: santa.id,
        attendeeIds: event.attendees.map(a => a.id),
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when the secret santa is already started', async () => {
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder().withEventId(event.id).started().build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        attendeeIds: event.attendees.map(a => a.id),
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when an attendee is already in the secret santa', async () => {
    const users = event.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build());
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder().withEventId(event.id).withUsers(users).build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        attendeeIds: [event.attendees[0]!.id],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when an attendee is not found for the event', async () => {
    const unknownAttendeeId = uuid() as AttendeeId;

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        attendeeIds: [unknownAttendeeId],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should add secret santa users and save them', async () => {
    const attendeeIds = event.attendees.map(a => a.id);

    const { users } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      secretSantaId: santa.id,
      attendeeIds,
    });

    expect(users).toHaveLength(attendeeIds.length);
    expect(users.map(user => user.attendeeId).toSorted()).toEqual([...attendeeIds].toSorted());
    expect(users.every(user => user.secretSantaId === santa.id)).toBe(true);
    expect(secretSantaUserRepository.saveAll).toHaveBeenCalledWith(users);
  });
});
