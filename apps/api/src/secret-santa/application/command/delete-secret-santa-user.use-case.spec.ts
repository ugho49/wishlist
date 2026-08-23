import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { ForbiddenException, Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { SecretSantaUser } from '../../domain/model/secret-santa-user.model';
import { DeleteSecretSantaUserUseCase } from './delete-secret-santa-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteSecretSantaUserUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: DeleteSecretSantaUserUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let santa: SecretSanta;
  let santaUser: SecretSantaUser;

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
    santa = new SecretSantaBuilder().withEventId(event.id).withUsers(users).build();

    secretSantaRepository.findByIdOrFail.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new DeleteSecretSantaUserUseCase(secretSantaRepository, secretSantaUserRepository, eventRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        secretSantaId: santa.id,
        secretSantaUserId: santaUser.id,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
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
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete the secret santa user', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(creator),
      secretSantaId: santa.id,
      secretSantaUserId: santaUser.id,
    });

    expect(secretSantaUserRepository.delete).toHaveBeenCalledWith(santaUser.id);
  });
});
