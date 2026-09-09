import type { WishlistItemRepository } from '../../../item/domain/wishlist-item.repository';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../../test-utils/builders/wishlist.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { Wishlist } from '../../domain/wishlist.model';
import { GetWishlistOwnerGiftProfileUseCase } from './get-wishlist-owner-gift-profile.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetWishlistOwnerGiftProfileUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const userRepository = createMock<UserRepository>();
  const itemRepository = createMock<WishlistItemRepository>();

  let useCase: GetWishlistOwnerGiftProfileUseCase;
  let owner: User;
  let participant: User;
  let wishlist: Wishlist;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    owner = new UserBuilder()
      .withEmail('marie@test.fr')
      .withName({ firstName: 'Marie', lastName: 'Dupont' })
      .build()
      .updateGiftProfile({
        clothingSize: 'M',
        shoeSize: '38',
        notes: 'Allergie au latex',
        address: { line1: '12 rue des Fleurs', postalCode: '75011', city: 'Paris', country: 'France' },
      });
    participant = new UserBuilder().withEmail('paul@test.fr').build();
    wishlist = new WishlistBuilder().withOwner(owner).build();

    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    wishlistRepository.hasAccess.mockResolvedValue(true);
    userRepository.findByIdOrFail.mockResolvedValue(owner);
    itemRepository.hasReservedOnWishlist.mockResolvedValue(false);

    useCase = new GetWishlistOwnerGiftProfileUseCase(wishlistRepository, userRepository, itemRepository);
  });

  it('should hide the profile from the owner when items are hidden', async () => {
    const result = await useCase.execute({
      currentUser: toCurrentUser(owner),
      wishlistId: wishlist.id,
    });

    expect(result).toBeUndefined();
    expect(itemRepository.hasReservedOnWishlist).not.toHaveBeenCalled();
  });

  it('should hide the address until the participant has reserved', async () => {
    const result = await useCase.execute({
      currentUser: toCurrentUser(participant),
      wishlistId: wishlist.id,
    });

    expect(result).toEqual({
      clothingSize: 'M',
      shoeSize: '38',
      notes: 'Allergie au latex',
    });
  });

  it('should include the address once the participant has reserved', async () => {
    itemRepository.hasReservedOnWishlist.mockResolvedValueOnce(true);

    const result = await useCase.execute({
      currentUser: toCurrentUser(participant),
      wishlistId: wishlist.id,
    });

    expect(result?.address).toEqual({
      line1: '12 rue des Fleurs',
      postalCode: '75011',
      city: 'Paris',
      country: 'France',
    });
  });

  it('should return nothing when the user cannot access the wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    const result = await useCase.execute({
      currentUser: toCurrentUser(participant),
      wishlistId: wishlist.id,
    });

    expect(result).toBeUndefined();
  });
});
