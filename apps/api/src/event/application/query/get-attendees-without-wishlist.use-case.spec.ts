import type { EventId } from '@wishlist/common';
import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { EventRepository } from '../../domain/repository/event.repository';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetAttendeesWithoutWishlistUseCase } from './get-attendees-without-wishlist.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

const byText = (left: string, right: string) => left.localeCompare(right);

describe('GetAttendeesWithoutWishlistUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: GetAttendeesWithoutWishlistUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    eventRepository.findByIds.mockResolvedValue([]);
    wishlistRepository.findFilledByEventIds.mockResolvedValue([]);

    useCase = new GetAttendeesWithoutWishlistUseCase(eventRepository, wishlistRepository);
  });

  it('should not query anything without events', async () => {
    expect(await useCase.execute({ eventIds: [] })).toEqual([]);
    expect(eventRepository.findByIds).not.toHaveBeenCalled();
    expect(wishlistRepository.findFilledByEventIds).not.toHaveBeenCalled();
  });

  it('should return the attendees without a filled wishlist of each event', async () => {
    const creator = new UserBuilder().withEmail('creator@test.fr').build();
    const participant = new UserBuilder().withEmail('participant@test.fr').build();
    const christmas = new EventBuilder().withCreator(creator).withAttendee(participant).build();
    const birthday = new EventBuilder().withCreator(creator).withPendingAttendee('pending@test.fr').build();

    eventRepository.findByIds.mockResolvedValueOnce([christmas, birthday]);
    wishlistRepository.findFilledByEventIds.mockResolvedValueOnce([
      new WishlistBuilder().withOwner(creator).withEventIds([christmas.id]).build(),
    ]);

    const result = await useCase.execute({ eventIds: [christmas.id, birthday.id] });

    expect(eventRepository.findByIds).toHaveBeenCalledWith([christmas.id, birthday.id]);
    expect(wishlistRepository.findFilledByEventIds).toHaveBeenCalledWith([christmas.id, birthday.id]);
    const emailsByEvent = new Map<EventId, string[]>(
      result.map(({ eventId, attendees }) => [eventId, attendees.map(a => a.getEmail()).toSorted(byText)]),
    );
    expect(emailsByEvent.get(christmas.id)).toEqual(['participant@test.fr']);
    expect(emailsByEvent.get(birthday.id)).toEqual(['creator@test.fr', 'pending@test.fr']);
  });
});
