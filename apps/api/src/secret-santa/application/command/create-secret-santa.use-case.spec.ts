import type { SecretSantaId } from '@wishlist/common';
import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { ConflictException, ForbiddenException, Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { CreateSecretSantaUseCase } from './create-secret-santa.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateSecretSantaUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const secretSantaRepository = createMock<SecretSantaRepository>();

  let useCase: CreateSecretSantaUseCase;
  let creator: User;
  let participant: User;
  let event: Event;
  let secretSantaId: SecretSantaId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    secretSantaId = uuid() as SecretSantaId;

    secretSantaRepository.existsForEvent.mockResolvedValue(false);
    eventRepository.findByIdOrFail.mockResolvedValue(event);
    secretSantaRepository.newId.mockReturnValue(secretSantaId);

    useCase = new CreateSecretSantaUseCase(eventRepository, secretSantaRepository);
  });

  it('should reject when a secret santa already exists for the event', async () => {
    secretSantaRepository.existsForEvent.mockResolvedValueOnce(true);

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id })).rejects.toThrow(
      ConflictException,
    );
    expect(eventRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(secretSantaRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(participant), eventId: event.id })).rejects.toThrow(
      ForbiddenException,
    );
    expect(secretSantaRepository.save).not.toHaveBeenCalled();
  });

  it('should create and save a secret santa', async () => {
    const { secretSanta } = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      description: 'Tirage au sort',
      budget: 30,
    });

    expect(secretSanta.id).toBe(secretSantaId);
    expect(secretSanta.eventId).toBe(event.id);
    expect(secretSanta.description).toBe('Tirage au sort');
    expect(secretSanta.budget).toBe(30);
    expect(secretSantaRepository.save).toHaveBeenCalledWith(secretSanta);
  });
});
