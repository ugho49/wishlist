import type { TransactionManager } from '../../../core/database/transaction-manager';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Event } from '../../domain/model/event.model';
import { DeleteEventUseCase } from './delete-event.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('DeleteEventUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const attendeeRepository = createMock<EventAttendeeRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: DeleteEventUseCase;
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
    wishlistRepository.findByEvent.mockResolvedValue([]);
    transactionManager.runInTransaction.mockImplementation(async fn => fn({} as never));

    useCase = new DeleteEventUseCase(eventRepository, attendeeRepository, wishlistRepository, transactionManager);
  });

  it('should reject when the current user cannot edit the event', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();

    await expect(useCase.execute({ currentUser: toCurrentUser(stranger), eventId: event.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventRepository.delete).not.toHaveBeenCalled();
  });

  it('should reject when the event still has wishlists', async () => {
    wishlistRepository.findByEvent.mockResolvedValueOnce([
      new WishlistBuilder().withOwner(creator).withEventIds([event.id]).build(),
    ]);

    await expect(useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id })).rejects.toThrow(
      BadRequestException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete attendees then the event in a transaction', async () => {
    const participant = new UserBuilder().withEmail('participant@test.fr').build();
    event = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    eventRepository.findByIdOrFail.mockResolvedValueOnce(event);

    await useCase.execute({ currentUser: toCurrentUser(creator), eventId: event.id });

    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
    expect(attendeeRepository.delete).toHaveBeenCalledTimes(event.attendees.length);
    for (const attendee of event.attendees) {
      expect(attendeeRepository.delete).toHaveBeenCalledWith(attendee.id, expect.anything());
    }
    expect(eventRepository.delete).toHaveBeenCalledWith(event.id, expect.anything());
  });
});
