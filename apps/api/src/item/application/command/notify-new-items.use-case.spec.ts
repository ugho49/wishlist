import type { EventRepository } from '../../../event/domain/repository/event.repository';
import type { NewItemsForEventWishlist, WishlistItemRepository } from '../../domain/wishlist-item.repository';

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
  const eventRepository = createMock<EventRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: {
      wishlist: { byId: (id: string) => `https://app/wishlists/${id}` },
      event: { byId: (id: string) => `https://app/events/${id}` },
    },
  } as never);

  let useCase: NotifyNewItemsUseCase;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();
    itemRepository.findAllNewItems.mockResolvedValue([]);
    eventRepository.findEmailsToNotify.mockResolvedValue([]);
    useCase = new NotifyNewItemsUseCase(itemRepository, eventRepository, mailService, frontendRoutes);
  });

  it('should do nothing when there are no new items', async () => {
    await useCase.execute();

    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(eventRepository.findEmailsToNotify).not.toHaveBeenCalled();
  });

  it('should skip an event that has no emails to notify', async () => {
    itemRepository.findAllNewItems.mockResolvedValueOnce([newItemsRow()]);

    await useCase.execute();

    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should send one recap email for two lists of the same event', async () => {
    const eventId = uuid();
    const firstWishlistId = uuid();
    const secondWishlistId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([
      newItemsRow({
        eventId,
        eventTitle: 'Noël',
        wishlistId: firstWishlistId,
        wishlistTitle: 'Liste Toto',
        ownerName: 'Marie',
        nbNewItems: 2,
      }),
      newItemsRow({
        eventId,
        eventTitle: 'Noël',
        wishlistId: secondWishlistId,
        wishlistTitle: 'Liste Tata',
        ownerName: 'Paul',
        nbNewItems: 1,
      }),
    ]);
    eventRepository.findEmailsToNotify.mockResolvedValueOnce([{ userId: uuid(), email: 'jean@test.fr' }]);

    await useCase.execute();

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: ['jean@test.fr'],
      subject: 'Nouveautés sur Noël',
      template: MailTemplate.NEW_ITEMS_REMINDER,
      context: {
        eventTitle: 'Noël',
        eventUrl: `https://app/events/${eventId}`,
        updates: [
          {
            ownerName: 'Marie',
            wishlistTitle: 'Liste Toto',
            wishlistUrl: `https://app/wishlists/${firstWishlistId}`,
            nbItems: 2,
          },
          {
            ownerName: 'Paul',
            wishlistTitle: 'Liste Tata',
            wishlistUrl: `https://app/wishlists/${secondWishlistId}`,
            nbItems: 1,
          },
        ],
      },
    });
  });

  it('should exclude the recipient own list from the recap', async () => {
    const eventId = uuid();
    const marieId = uuid();
    const paulWishlistId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([
      newItemsRow({ eventId, ownerId: marieId, ownerName: 'Marie', wishlistTitle: 'Liste Marie', nbNewItems: 2 }),
      newItemsRow({
        eventId,
        wishlistId: paulWishlistId,
        ownerName: 'Paul',
        wishlistTitle: 'Liste Paul',
        nbNewItems: 1,
      }),
    ]);
    eventRepository.findEmailsToNotify.mockResolvedValueOnce([{ userId: marieId, email: 'marie@test.fr' }]);

    await useCase.execute();

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: ['marie@test.fr'],
      context: {
        updates: [
          {
            ownerName: 'Paul',
            wishlistTitle: 'Liste Paul',
            wishlistUrl: `https://app/wishlists/${paulWishlistId}`,
            nbItems: 1,
          },
        ],
      },
    });
  });

  it('should not email a recipient when only their own list changed', async () => {
    const ownerId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([newItemsRow({ ownerId })]);
    eventRepository.findEmailsToNotify.mockResolvedValueOnce([{ userId: ownerId, email: 'marie@test.fr' }]);

    await useCase.execute();

    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it('should send one email per event', async () => {
    const christmasId = uuid();
    const birthdayId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([
      newItemsRow({ eventId: christmasId, eventTitle: 'Noël' }),
      newItemsRow({ eventId: birthdayId, eventTitle: 'Anniversaire' }),
    ]);
    eventRepository.findEmailsToNotify
      .mockResolvedValueOnce([{ userId: uuid(), email: 'jean@test.fr' }])
      .mockResolvedValueOnce([{ userId: uuid(), email: 'jean@test.fr' }]);

    await useCase.execute();

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({ subject: 'Nouveautés sur Noël' });
    expect(mailService.sendMail.mock.calls[1]?.[0]).toMatchObject({ subject: 'Nouveautés sur Anniversaire' });
  });

  it('should bulk-send the same recap to recipients who share it', async () => {
    const eventId = uuid();
    itemRepository.findAllNewItems.mockResolvedValueOnce([newItemsRow({ eventId, ownerName: 'Marie' })]);
    eventRepository.findEmailsToNotify.mockResolvedValueOnce([
      { userId: uuid(), email: 'jean@test.fr' },
      { userId: uuid(), email: 'paul@test.fr' },
    ]);

    await useCase.execute();

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: ['jean@test.fr', 'paul@test.fr'],
    });
  });

  it('should swallow errors from fetching new items', async () => {
    itemRepository.findAllNewItems.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute()).resolves.toBeUndefined();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });
});

function newItemsRow(overrides: Partial<NewItemsForEventWishlist> = {}): NewItemsForEventWishlist {
  return {
    eventId: uuid(),
    eventTitle: 'Noël',
    wishlistId: uuid(),
    wishlistTitle: 'Liste',
    ownerId: uuid(),
    ownerName: 'Jean',
    nbNewItems: 2,
    ...overrides,
  };
}
