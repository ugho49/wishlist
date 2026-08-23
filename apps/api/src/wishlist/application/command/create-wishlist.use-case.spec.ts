import type { WishlistId } from '@wishlist/common';
import type { BucketService } from '../../../core/bucket/bucket.service';
import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { EventBuilder } from '../../../../test-utils/builders/event.builder';
import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { Event } from '../../../event/domain/model/event.model';
import { User } from '../../../user/domain/model/user.model';
import { CreateWishlistUseCase } from './create-wishlist.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateWishlistUseCase', () => {
  const wishlistRepository = createMock<WishlistRepository>();
  const eventRepository = createMock<EventRepository>();
  const userRepository = createMock<UserRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: CreateWishlistUseCase;
  let owner: User;
  let event: Event;
  let wishlistId: WishlistId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    owner = new UserBuilder().withEmail('owner@test.fr').build();
    event = new EventBuilder().withCreator(owner).build();
    wishlistId = uuid() as WishlistId;

    eventRepository.findByIds.mockResolvedValue([event]);
    userRepository.findByIdOrFail.mockResolvedValue(owner);
    wishlistRepository.newId.mockReturnValue(wishlistId);
    bucketService.getLogoDestination.mockReturnValue(`pictures/wishlists/${wishlistId}/logo`);
    bucketService.uploadFile.mockResolvedValue('https://cdn.example.com/logo.png');

    useCase = new CreateWishlistUseCase(wishlistRepository, eventRepository, userRepository, bucketService);
  });

  it('should reject when one or more events are not found', async () => {
    eventRepository.findByIds.mockResolvedValueOnce([]);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        newWishlist: { title: 'Ma liste', eventIds: [event.id] },
      }),
    ).rejects.toThrow(NotFoundException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when the current user cannot add a wishlist to an event', async () => {
    const stranger = new UserBuilder().withEmail('stranger@test.fr').build();
    eventRepository.findByIds.mockResolvedValueOnce([new EventBuilder().withCreator(stranger).build()]);

    await expect(
      useCase.execute({
        currentUser: toCurrentUser(owner),
        newWishlist: { title: 'Ma liste', eventIds: [event.id] },
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(wishlistRepository.save).not.toHaveBeenCalled();
  });

  it('should create a wishlist with hideItems defaulting to true', async () => {
    const wishlist = await useCase.execute({
      currentUser: toCurrentUser(owner),
      newWishlist: { title: 'Ma liste', description: 'Anniversaire', eventIds: [event.id] },
    });

    expect(wishlist.id).toBe(wishlistId);
    expect(wishlist.title).toBe('Ma liste');
    expect(wishlist.description).toBe('Anniversaire');
    expect(wishlist.hideItems).toBe(true);
    expect(wishlist.eventIds).toEqual([event.id]);
    expect(wishlist.logoUrl).toBeUndefined();
    expect(wishlistRepository.save).toHaveBeenCalledWith(wishlist);
    expect(bucketService.uploadFile).not.toHaveBeenCalled();
  });

  it('should create a wishlist with hideItems set to false when provided', async () => {
    const wishlist = await useCase.execute({
      currentUser: toCurrentUser(owner),
      newWishlist: { title: 'Liste publique', eventIds: [event.id], hideItems: false },
    });

    expect(wishlist.hideItems).toBe(false);
    expect(wishlistRepository.save).toHaveBeenCalledWith(wishlist);
  });

  it('should upload the logo and persist its url when an image file is provided', async () => {
    const imageFile = { originalname: 'logo.png' } as Express.Multer.File;

    const wishlist = await useCase.execute({
      currentUser: toCurrentUser(owner),
      newWishlist: { title: 'Ma liste', eventIds: [event.id], imageFile },
    });

    expect(bucketService.getLogoDestination).toHaveBeenCalledWith(wishlistId);
    expect(bucketService.uploadFile).toHaveBeenCalledWith({
      destination: `pictures/wishlists/${wishlistId}/logo`,
      file: imageFile,
    });
    expect(wishlist.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(wishlistRepository.save).toHaveBeenCalledWith(wishlist);
  });
});
