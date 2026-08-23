import type { EventRepository } from '../../domain/repository/event.repository';

import { Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { GetEventsByIdsUseCase } from './get-events-by-ids.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventsByIdsUseCase', () => {
  const eventRepository = createMock<EventRepository>();

  let useCase: GetEventsByIdsUseCase;
  let creator: User;
  let event: Event;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    event = new EventBuilder().withCreator(creator).build();

    eventRepository.findByIds.mockResolvedValue([event]);

    useCase = new GetEventsByIdsUseCase(eventRepository);
  });

  it('should return events the current user can view', async () => {
    const events = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventIds: [event.id],
    });

    expect(events).toEqual([event]);
  });

  it('should filter out events the current user cannot view', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    const hiddenEvent = new EventBuilder().withCreator(stranger).build();
    eventRepository.findByIds.mockResolvedValueOnce([event, hiddenEvent]);

    const events = await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventIds: [event.id, hiddenEvent.id],
    });

    expect(events).toEqual([event]);
  });
});
