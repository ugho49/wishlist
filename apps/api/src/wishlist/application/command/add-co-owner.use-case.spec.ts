import type { EventBus } from '@nestjs/cqrs';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain/event/user-added-as-co-owner-to-wishlist.event';
import { Wishlist } from '../../domain/wishlist.model';
import { AddCoOwnerUseCase } from './add-co-owner.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('AddCoOwnerUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const userRepository = createMock<UserRepository>();
  const eventBus = createMock<EventBus>();

  let useCase: AddCoOwnerUseCase;
  let owner: User;
  let coOwner: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    coOwner = new UserBuilder().withEmail('coowner@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).withHideItems(false).build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    userRepository.findByIdOrFail.mockResolvedValue(coOwner);

    useCase = new AddCoOwnerUseCase(wishlistRepository, userRepository, eventBus);
  });

  it('should reject when the current user is not the owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(coOwner),
        wishlistId: wishlist.id,
        coOwnerId: coOwner.id,
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the wishlist is private', async () => {
    wishlistRepository.findByIdOrFail.mockResolvedValueOnce(
      new WishlistBuilder().withOwner(owner).withHideItems(true).build(),
    );

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        coOwnerId: coOwner.id,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when adding the owner as co-owner', async () => {
    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        wishlistId: wishlist.id,
        coOwnerId: owner.id,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should add the co-owner, persist and publish an event', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
      coOwnerId: coOwner.id,
    });

    expect(wishlistRepository.save).toHaveBeenCalledTimes(1);
    const savedWishlist = wishlistRepository.save.mock.calls[0]?.[0];
    expect(savedWishlist?.coOwnerId).toBe(coOwner.id);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = eventBus.publish.mock.calls[0]?.[0] as UserAddedAsCoOwnerToWishlistEvent;
    expect(publishedEvent).toBeInstanceOf(UserAddedAsCoOwnerToWishlistEvent);
    expect(publishedEvent.coOwner).toBe(coOwner);
  });
});
