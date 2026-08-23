import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { ConflictException, ForbiddenException, Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { UpdateSecretSantaUseCase } from './update-secret-santa.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateSecretSantaUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: UpdateSecretSantaUseCase;
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
    const users = event.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build());
    santa = new SecretSantaBuilder().withEventId(event.id).withUsers(users).withBudget(20).build();

    secretSantaRepository.findByIdOrFail.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new UpdateSecretSantaUseCase(secretSantaRepository, eventRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(participant),
        secretSantaId: santa.id,
        budget: 40,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(secretSantaRepository.save).not.toHaveBeenCalled();
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
        budget: 40,
      }),
    ).rejects.toThrow(ConflictException);
    expect(secretSantaRepository.save).not.toHaveBeenCalled();
  });

  it('should update and save the secret santa', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(creator),
      secretSantaId: santa.id,
      description: 'Nouveau budget',
      budget: 50,
    });

    expect(secretSantaRepository.save).toHaveBeenCalledTimes(1);
    const saved = secretSantaRepository.save.mock.calls[0]?.[0];
    expect(saved?.description).toBe('Nouveau budget');
    expect(saved?.budget).toBe(50);
    expect(saved?.id).toBe(santa.id);
  });
});
