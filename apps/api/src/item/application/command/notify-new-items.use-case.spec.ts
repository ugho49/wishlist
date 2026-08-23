import type { WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Logger } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { createMock } from '../../../../test-utils/mocks';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { NotifyNewItemsUseCase } from './notify-new-items.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('NotifyNewItemsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: { wishlist: { byId: (id: string) => `https://app/wishlists/${id}` } },
  } as never);

  let useCase: NotifyNewItemsUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    itemRepository.findAllNewItems.mockResolvedValue([]);
    useCase = new NotifyNewItemsUseCase(itemRepository, wishlistRepository, mailService, frontendRoutes);
  });

  it('should do nothing when there are no new items', async () => {
    await useCase.execute();

    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should skip a wishlist that has no emails to notify', async () => {
    itemRepository.findAllNewItems.mockResolvedValueOnce([
      { wishlistId: uuid(), wishlistTitle: 'Liste', ownerId: uuid(), ownerName: 'Jean', nbNewItems: 2 },
    ]);
    wishlistRepository.findEmailsToNotify.mockResolvedValueOnce([]);

    await useCase.execute();

    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should send a reminder email when there are new items and recipients', async () => {
    const wishlistId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([
      { wishlistId, wishlistTitle: 'Liste', ownerId: uuid(), ownerName: 'Jean', nbNewItems: 3 },
    ]);
    wishlistRepository.findEmailsToNotify.mockResolvedValueOnce(['a@test.fr']);

    await useCase.execute();

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: ['a@test.fr'],
      template: MailTemplate.NEW_ITEMS_REMINDER,
      context: {
        wishlistTitle: 'Liste',
        nbItems: 3,
        userName: 'Jean',
      },
    });
  });

  it('should swallow errors from fetching new items', async () => {
    itemRepository.findAllNewItems.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });
});
