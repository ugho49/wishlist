import type { EventBus } from '@nestjs/cqrs';
import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { SecretSantaRepository } from '../../domain/repository/secret-santa.repository';
import type { SecretSantaUserRepository } from '../../domain/repository/secret-santa-user.repository';

import { BadRequestException, ForbiddenException, Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { SecretSantaBuilder } from '../../../../test-utils/builders/secret-santa.builder';
import { SecretSantaUserBuilder } from '../../../../test-utils/builders/secret-santa-user.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { SecretSantaStartedEvent } from '../../domain/event/secret-santa-started.event';
import { SecretSanta } from '../../domain/model/secret-santa.model';
import { StartSecretSantaUseCase } from './start-secret-santa.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('StartSecretSantaUseCase', () => {
  const secretSantaRepository = createMock<SecretSantaRepository>();
  const secretSantaUserRepository = createMock<SecretSantaUserRepository>();
  const eventRepository = createMock<EventRepository>();
  const eventBus = createMock<EventBus>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: StartSecretSantaUseCase;
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
    santa = new SecretSantaBuilder().withEventId(event.id).withUsers(users).withBudget(25).build();

    secretSantaRepository.findByIdOrFail.mockResolvedValue(santa);
    eventRepository.findByIdOrFail.mockResolvedValue(event);
    transactionManager.runInTransaction.mockImplementation(async fn => fn({} as never));

    useCase = new StartSecretSantaUseCase(
      secretSantaRepository,
      secretSantaUserRepository,
      eventRepository,
      eventBus,
      transactionManager,
    );
  });

  it('should reject when the current user cannot edit the event', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(participant), secretSantaId: santa.id })).rejects.toThrow(
      ForbiddenException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the secret santa is already started', async () => {
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder()
        .withEventId(event.id)
        .withUsers(event.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build()))
        .started()
        .build(),
    );

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), secretSantaId: santa.id })).rejects.toThrow(
      ForbiddenException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the event is already finished', async () => {
    const finishedEvent = new EventBuilder().withCreator(creator).withAttendee(participant).finished().build();
    const users = finishedEvent.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build());
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder().withEventId(finishedEvent.id).withUsers(users).build(),
    );
    eventRepository.findByIdOrFail.mockResolvedValueOnce(finishedEvent);

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), secretSantaId: santa.id })).rejects.toThrow(
      BadRequestException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when there are not enough users to start', async () => {
    const soloEvent = new EventBuilder().withCreator(creator).build();
    const users = soloEvent.attendees.map(a => new SecretSantaUserBuilder().withAttendeeId(a.id).build());
    secretSantaRepository.findByIdOrFail.mockResolvedValueOnce(
      new SecretSantaBuilder().withEventId(soloEvent.id).withUsers(users).build(),
    );
    eventRepository.findByIdOrFail.mockResolvedValueOnce(soloEvent);

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), secretSantaId: santa.id })).rejects.toThrow(
      BadRequestException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should assign the draw, persist in a transaction and publish an event', async () => {
    await useCase.execute({ currentUser: toCurrentUser(creator), secretSantaId: santa.id });

    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(secretSantaUserRepository.saveAll).toHaveBeenCalledTimes(1);
    expect(secretSantaRepository.save).toHaveBeenCalledTimes(1);

    const savedSanta = secretSantaRepository.save.mock.calls[0]?.[0];
    expect(savedSanta?.isStarted()).toBe(true);
    expect(savedSanta?.users.every(user => user.drawUserId !== undefined)).toBe(true);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const published = eventBus.publish.mock.calls[0]?.[0];
    expect(published).toBeInstanceOf(SecretSantaStartedEvent);
    expect(published).toMatchObject({
      eventTitle: event.title,
      eventId: event.id,
      budget: 25,
      drawns: event.attendees.map(attendee => ({ email: attendee.getEmail() })),
    });
  });
});
