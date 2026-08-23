import type { EventId } from '@wishlist/common';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { UnlinkWishlistFromEventUseCase } from './unlink-wishlist-from-event.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UnlinkWishlistFromEventUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();

  let useCase: UnlinkWishlistFromEventUseCase;
  let owner: User;
  let coOwner: User;
  let stranger: User;
  let eventId: EventId;
  let otherEventId: EventId;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    eventId = uuid() as EventId;
    otherEventId = uuid() as EventId;
    wishlist = new WishlistBuilder()
      .withOwner(owner)
      .withCoOwner(coOwner)
      .withEventIds([eventId, otherEventId])
      .build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);

    useCase = new UnlinkWishlistFromEventUseCase(wishlistRepository);
  });

  it('should reject when the current user is neither owner nor co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(stranger),
        wishlistId: wishlist.id,
        eventId,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the wishlist is not linked to the event', async () => {
    const unlinkedEventId = uuid() as EventId;

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        eventId: unlinkedEventId,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the wishlist is linked to only one event', async () => {
    wishlistRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistBuilder().withOwner(owner).withEventIds([eventId]).build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        eventId,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should unlink the event when the owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      eventId,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.eventIds).toEqual([otherEventId]);
  });

  it('should unlink the event when the co-owner requests it', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(coOwner),
      wishlistId: wishlist.id,
      eventId,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.isLinkedToEvent(eventId)).toBe(false);
  });
});
