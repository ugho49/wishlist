import type { EventRepository } from '../../domain/repository/event.repository';

import { Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { GetEventsByUserUseCase } from './get-events-by-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventsByUserUseCase', () => {
  const eventRepository = createMock<EventRepository>();

  let useCase: GetEventsByUserUseCase;
  let user: User;
  let event: Event;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    event = new EventBuilder().withCreator(user).build();
    eventRepository.findByUserIdPaginated.mockResolvedValue({ events: [event], totalCount: 1 });

    useCase = new GetEventsByUserUseCase(eventRepository);
  });

  it('should return paginated events for the user', async () => {
    const result = await useCase.execute({
      userId: user.id,
      pageNumber: 2,
      pageSize: 10,
      ignorePastEvents: true,
    });

    expect(result).toEqual({ events: [event], totalCount: 1 });
    expect(eventRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
      onlyFuture: true,
    });
  });
});
