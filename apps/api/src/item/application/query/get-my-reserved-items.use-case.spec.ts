import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../../user/domain/model/user.model';
import { GetMyReservedItemsUseCase } from './get-my-reserved-items.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetMyReservedItemsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();

  let useCase: GetMyReservedItemsUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    itemRepository.findReservedByUserPaginated.mockResolvedValue({
      items: [
        {
          id: uuid(),
          name: 'Un livre',
          takenAt: new Date('2026-01-02T00:00:00.000Z'),
          wishlistId: uuid(),
          wishlistTitle: 'Noel',
          ownerFirstName: 'Ada',
          ownerLastName: 'Lovelace',
          events: [],
          takers: [],
        },
      ],
      totalCount: 1,
    });

    useCase = new GetMyReservedItemsUseCase(itemRepository);
  });

  it('should return the gifts the user reserved, paginated', async () => {
    const result = await useCase.execute({ userId: user.id, pageNumber: 2, pageSize: 10 });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(itemRepository.findReservedByUserPaginated).toHaveBeenCalledWith({
      userId: user.id,
      pagination: { take: 10, skip: 10 },
    });
  });
});
