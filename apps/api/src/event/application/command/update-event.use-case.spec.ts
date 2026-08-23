import type { EventRepository } from '../../domain/repository/event.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { UpdateEventUseCase } from './update-event.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateEventUseCase', () => {
  const eventRepository = createMock<EventRepository>();

  let useCase: UpdateEventUseCase;
  let creator: User;
  let event: Event;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').build();
    event = new EventBuilder().withCreator(creator).build();

    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new UpdateEventUseCase(eventRepository);
  });

  it('should reject when the current user cannot edit the event', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        eventId: event.id,
        updateEvent: { title: 'Nouveau titre', eventDate: event.eventDate },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(eventRepository.save).not.toHaveBeenCalled();
  });

  it('should update the event when the creator requests it', async () => {
    const updateEvent = {
      title: 'Nouveau titre',
      description: 'Une description',
      icon: '🎉',
      eventDate: new Date(Date.now() + 172_800_000),
    };

    await useCase.execute({
      currentUser: toCurrentUser(creator),
      eventId: event.id,
      updateEvent,
    });

    expect(eventRepository.save).toHaveBeenCalledTimes(1);
    const savedEvent = eventRepository.save.mock.calls[0]?.[0];
    expect(savedEvent?.title).toBe(updateEvent.title);
    expect(savedEvent?.description).toBe(updateEvent.description);
    expect(savedEvent?.icon).toBe(updateEvent.icon);
    expect(savedEvent?.eventDate).toBe(updateEvent.eventDate);
  });
});
