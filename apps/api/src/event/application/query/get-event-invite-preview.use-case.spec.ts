import type { EventRepository } from '../../domain/repository/event.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { GetEventInvitePreviewUseCase } from './get-event-invite-preview.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetEventInvitePreviewUseCase', () => {
  const eventRepository = createMock<EventRepository>();

  let useCase: GetEventInvitePreviewUseCase;
  let creator: User;
  let event: Event;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    creator = new UserBuilder().withEmail('creator@test.fr').withName({ firstName: 'Léa', lastName: 'Martin' }).build();
    event = new EventBuilder().withCreator(creator).withTitle('Anniversaire').build();
    eventRepository.findByInviteToken.mockResolvedValue(event);

    useCase = new GetEventInvitePreviewUseCase(eventRepository);
  });

  it('should reject when the token is unknown', async () => {
    eventRepository.findByInviteToken.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ token: 'unknown' })).rejects.toThrow(NotFoundException);
  });

  it('should return a public preview without leaking attendee emails', async () => {
    const { preview } = await useCase.execute({ token: event.inviteToken });

    expect(preview.title).toBe('Anniversaire');
    expect(preview.hostDisplayName).toBe('Léa Martin');
    expect(preview.attendeeCount).toBe(1);
    expect(preview.alreadyJoined).toBe(false);
    expect(preview).not.toHaveProperty('inviteToken');
  });

  it('should mark the preview as already joined for an attendee', async () => {
    const { preview } = await useCase.execute({
      token: event.inviteToken,
      currentUser: toCurrentUser(creator),
    });

    expect(preview.alreadyJoined).toBe(true);
  });
});
