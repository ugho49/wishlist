import type { SecretSantaUserId } from '@wishlist/common';
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
import { SecretSantaUser } from '../../domain/model/secret-santa-user.model';
import { UpdateSecretSantaUserUseCase } from './update-secret-santa-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateSecretSantaUserUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: UpdateSecretSantaUserUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let santa: SecretSanta;
  let santaUser: SecretSantaUser;
  let otherSantaUser: SecretSantaUser;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    const users = event.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build());
    santaUser = users[0]!;
    otherSantaUser = users[1]!;
    santa = new SecretSantaBuilder().withEventId(event.id).withUsers(users).build();

    secretSantaRepository.findByIdOrFail.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new UpdateSecretSantaUserUseCase(secretSantaRepository, secretSantaUserRepository, eventRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        secretSantaId: santa.id,
        secretSantaUserId: santaUser.id,
        exclusions: [otherSantaUser.id],
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when the secret santa is already started', async () => {
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder()
        .withEventId(event.id)
        .withUsers(event.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build()))
        .started()
        .build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        secretSantaUserId: santaUser.id,
        exclusions: [otherSantaUser.id],
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when the user excludes himself', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        secretSantaUserId: santaUser.id,
        exclusions: [santaUser.id],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should reject when the secret santa user is not found', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(creator),
        secretSantaId: santa.id,
        secretSantaUserId: uuid() as SecretSantaUserId,
        exclusions: [otherSantaUser.id],
      }),
    ).rejects.toThrow('Secret Santa user not found');
    expect(secretSantaUserRepository.saveAll).not.toHaveBeenCalled();
  });

  it('should update exclusions and save all users', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(creator),
      secretSantaId: santa.id,
      secretSantaUserId: santaUser.id,
      exclusions: [otherSantaUser.id],
    });

    expect(secretSantaUserRepository.saveAll).toHaveBeenCalledTimes(1);
    const savedUsers = secretSantaUserRepository.saveAll.mock.calls[0]?.[0];
    const updated = savedUsers?.find(user => user.id === santaUser.id);
    expect(updated?.exclusions).toEqual([otherSantaUser.id]);
  });
});
