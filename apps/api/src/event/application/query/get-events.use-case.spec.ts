import type { EventRepository } from '../../domain/repository/event.repository';

import { BadRequestException } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetEventsUseCase } from './get-events.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventsUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  let useCase: GetEventsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetEventsUseCase(eventRepository);
  });

  it('should reject when the criteria is shorter than 2 characters', async () => {
    await expect(useCase.execute({ pageNumber: 1, pageSize: 10, criteria: 'a' })).rejects.toThrow(BadRequestException);
    expect(eventRepository.findAllPaginated).not.toHaveBeenCalled();
  });

  it('should return paginated events', async () => {
    const events = [new EventBuilder().withCreator(new UserBuilder().build()).build()];
    eventRepository.findAllPaginated.mockResolvedValueOnce({ events, totalCount: 11 });

    const result = await useCase.execute({ pageNumber: 2, pageSize: 10 });

    expect(result).toEqual({ events, totalCount: 11 });
    expect(eventRepository.findAllPaginated).toHaveBeenCalledWith({
      pagination: { take: 10, skip: 10 },
      criteria: undefined,
    });
  });

  it('should return paginated events matching the criteria', async () => {
    const events = [new EventBuilder().withCreator(new UserBuilder().build()).build()];
    eventRepository.findAllPaginated.mockResolvedValueOnce({ events, totalCount: 1 });

    const result = await useCase.execute({ pageNumber: 1, pageSize: 10, criteria: ' Noël ' });

    expect(result).toEqual({ events, totalCount: 1 });
    expect(eventRepository.findAllPaginated).toHaveBeenCalledWith({
      pagination: { take: 10, skip: 0 },
      criteria: 'Noël',
    });
  });
});
