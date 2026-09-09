import type { EventId } from '@wishlist/common';
import type { TakenGiftRecord, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { WishlistItemBuilder } from '../../../../test-utils/builders/wishlist-item.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { GetMyTakenItemsUseCase } from './get-my-taken-items.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetMyTakenItemsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();

  let useCase: GetMyTakenItemsUseCase;
  let currentUser: User;
  let takenGift: TakenGiftRecord;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('giver@test.fr').build();
    const recipient = new UserBuilder()
      .withEmail('marie@test.fr')
      .withName({ firstName: 'Marie', lastName: 'Dupont' })
      .build();
    const item = new WishlistItemBuilder().withName('Un livre').takenBy(currentUser).build();
    takenGift = {
      item,
      takenAt: new Date('2025-12-01T10:00:00.000Z'),
      wishlistId: item.wishlistId,
      wishlistTitle: 'Liste de Marie',
      recipient: {
        id: recipient.id,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        pictureUrl: recipient.pictureUrl,
      },
      events: [
        {
          id: uuid() as EventId,
          title: 'Anniversaire Marie',
          eventDate: new Date('2025-12-20'),
        },
      ],
    };

    itemRepository.findTakenByUser.mockResolvedValue({ items: [takenGift], totalCount: 1 });
    useCase = new GetMyTakenItemsUseCase(itemRepository);
  });

  it('should return gifts reserved by the current user', async () => {
    const result = await useCase.execute({
      currentUser: toCurrentUser(currentUser),
      pageNumber: 1,
      pageSize: 10,
      scope: 'ALL',
    });

    expect(result).toEqual({ items: [takenGift], totalCount: 1 });
    expect(itemRepository.findTakenByUser).toHaveBeenCalledWith({
      userId: currentUser.id,
      pagination: { take: 10, skip: 0 },
      scope: 'ALL',
    });
  });

  it('should paginate from the requested page', async () => {
    itemRepository.findTakenByUser.mockResolvedValueOnce({ items: [], totalCount: 12 });

    const result = await useCase.execute({
      currentUser: toCurrentUser(currentUser),
      pageNumber: 2,
      pageSize: 10,
      scope: 'PAST',
    });

    expect(result.totalCount).toBe(12);
    expect(itemRepository.findTakenByUser).toHaveBeenCalledWith({
      userId: currentUser.id,
      pagination: { take: 10, skip: 10 },
      scope: 'PAST',
    });
  });

  it('should forward the upcoming scope', async () => {
    await useCase.execute({
      currentUser: toCurrentUser(currentUser),
      pageNumber: 1,
      pageSize: 5,
      scope: 'UPCOMING',
    });

    expect(itemRepository.findTakenByUser).toHaveBeenCalledWith({
      userId: currentUser.id,
      pagination: { take: 5, skip: 0 },
      scope: 'UPCOMING',
    });
  });
});
