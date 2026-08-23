import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';

import { ForbiddenException, Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { GetSecretSantaUseCase } from './get-secret-santa.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetSecretSantaUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: GetSecretSantaUseCase;
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
    santa = new SecretSantaBuilder().withEventId(event.id).withUsers(users).build();

    secretSantaRepository.findForEvent.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new GetSecretSantaUseCase(secretSantaRepository, eventRepository);
  });

  it('should return undefined when no secret santa exists for the event', async () => {
    secretSantaRepository.findForEvent.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id });

    expect(result.secretSanta).toBeUndefined();
    expect(eventRepository.findByIdOrFail).not.toHaveBeenCalled();
  });

  it('should reject when the current user cannot view the event', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();

    await expect(useCase.execute({ currentUser: toCurrentUser(stranger), eventId: event.id })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return the secret santa when the user can view the event', async () => {
    const result = await useCase.execute({ currentUser: toCurrentUser(participant), eventId: event.id });

    expect(result.secretSanta).toBe(santa);
  });
});
