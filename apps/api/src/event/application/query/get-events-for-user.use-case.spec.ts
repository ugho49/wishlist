import type { EventRepository } from '../../domain/repository/event.repository';

import { BadRequestException, Logger } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { GetEventsForUserUseCase } from './get-events-for-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventsForUserUseCase', () => {
  const eventRepository = createMock<EventRepository>();

  let useCase: GetEventsForUserUseCase;
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

    useCase = new GetEventsForUserUseCase(eventRepository);
  });

  it('should return paginated events for the user', async () => {
    const result = await useCase.execute({
      userId: user.id,
      pageNumber: 2,
      pageSize: 10,
      ignorePastEvents: false,
    });

    expect(result).toEqual({ events: [event], totalCount: 1 });
    expect(eventRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
      onlyFuture: false,
      criteria: undefined,
    });
  });

  it('should reject when the criteria is shorter than 2 characters', async () => {
    await expect(
      useCase.execute({
        userId: user.id,
        pageNumber: 1,
        pageSize: 10,
        ignorePastEvents: false,
        criteria: 'a',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(eventRepository.findByUserIdPaginated).not.toHaveBeenCalled();
  });

  it('should return paginated events matching the criteria', async () => {
    const result = await useCase.execute({
      userId: user.id,
      pageNumber: 1,
      pageSize: 10,
      ignorePastEvents: true,
      criteria: 'anniv',
    });

    expect(result).toEqual({ events: [event], totalCount: 1 });
    expect(eventRepository.findByUserIdPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 0 },
      onlyFuture: true,
      criteria: 'anniv',
    });
  });
});
