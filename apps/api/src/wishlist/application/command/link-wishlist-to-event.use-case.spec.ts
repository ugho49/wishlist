import type { EventId } from '@wishlist/common';
import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { MAX_EVENTS_BY_LIST, uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { LinkWishlistToEventUseCase } from './link-wishlist-to-event.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LinkWishlistToEventUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const eventRepository = createMock<EventRepository>();

  let useCase: LinkWishlistToEventUseCase;
  let owner: User;
  let coOwner: User;
  let stranger: User;
  let wishlist: Wishlist;
  let event: Event;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).build();
    event = new EventBuilder().withCreator(owner).withAttendee(coOwner).build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    eventRepository.findByIdOrFail.mockResolvedValue(event);

    useCase = new LinkWishlistToEventUseCase(wishlistRepository, eventRepository);
  });

  it('should reject when the current user is neither owner nor co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
        eventId: event.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(eventRepository.findByIdOrFail).not.toHaveBeenCalled();
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the current user cannot add a wishlist to the event', async () => {
    eventRepository.findByIdOrFail.mockResolvedValueOnce(new EventBuilder().withCreator(stranger).build());

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        eventId: event.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the wishlist is already linked to the maximum number of events', async () => {
    const eventIds = Array.from({ length: MAX_EVENTS_BY_LIST }, () => uuid() as EventId);
    wishlistRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistBuilder().withOwner(owner).withEventIds(eventIds).build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        eventId: event.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the wishlist is already linked to the event', async () => {
    wishlistRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistBuilder().withOwner(owner).withEventIds([event.id]).build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        eventId: event.id,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should link the event when the owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      eventId: event.id,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.eventIds).toContain(event.id);
  });

  it('should link the event when the co-owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
      eventId: event.id,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.eventIds).toContain(event.id);
  });
});
