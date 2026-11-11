import type { ItemDigestReceiptRepository } from '../../domain/item-digest-receipt.repository';
import type { NewItemNotificationRow, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { uuid } from '@wishlist/common';
import { DateTime } from 'luxon';

import { createMock } from '../../../../test-utils/mocks';
import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { NotifyNewItemsUseCase } from './notify-new-items.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

const now = DateTime.fromISO('2026-11-03T08:00:00.000Z');
const digestDate = '2026-11-03';

describe('NotifyNewItemsUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const receiptRepository = createMock<ItemDigestReceiptRepository>();
  const mailService = createMock<MailService>();
  const frontendRoutes = createMock<FrontendRoutesService>({
    routes: {
      wishlist: { byId: (id: string) => `https://app/wishlists/${id}` },
    },
  } as never);

  let useCase: NotifyNewItemsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    itemRepository.findNewItemNotifications.mockResolvedValue([]);
    receiptRepository.claim.mockResolvedValue(true);
    useCase = new NotifyNewItemsUseCase(itemRepository, receiptRepository, mailService, frontendRoutes);
  });

  it('should do nothing when there are no new items', async () => {
    await useCase.execute(now);

    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(receiptRepository.claim).not.toHaveBeenCalled();
  });

  it('should send one recap with two lists of the same event', async () => {
    const recipientId = uuid();
    const eventId = uuid();
    const firstWishlistId = uuid();
    const secondWishlistId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({
        recipientUserId: recipientId,
        recipientEmail: 'jean@test.fr',
        eventId,
        eventTitle: 'Noël',
        wishlistId: firstWishlistId,
        wishlistTitle: 'Liste Toto',
        ownerName: 'Marie',
        nbNewItems: 2,
      }),
      notificationRow({
        recipientUserId: recipientId,
        recipientEmail: 'jean@test.fr',
        eventId,
        eventTitle: 'Noël',
        wishlistId: secondWishlistId,
        wishlistTitle: 'Liste Tata',
        ownerName: 'Paul',
        nbNewItems: 1,
      }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'jean@test.fr',
      subject: 'Nouveautés sur les listes',
      template: MailTemplate.NEW_ITEMS_REMINDER,
      idempotencyKey: `new-items/${recipientId}/${digestDate}`,
      context: {
        updates: [
          {
            ownerName: 'Marie',
            wishlistTitle: 'Liste Toto',
            wishlistUrl: `https://app/wishlists/${firstWishlistId}`,
            nbItems: 2,
            eventTitles: ['Noël'],
          },
          {
            ownerName: 'Paul',
            wishlistTitle: 'Liste Tata',
            wishlistUrl: `https://app/wishlists/${secondWishlistId}`,
            nbItems: 1,
            eventTitles: ['Noël'],
          },
        ],
      },
    });
    expect(receiptRepository.claim).toHaveBeenCalledWith({ userId: recipientId, digestDate });
  });

  it('should send one mail when the same list is linked to two events', async () => {
    const recipientId = uuid();
    const wishlistId = uuid();
    const christmasId = uuid();
    const birthdayId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({
        recipientUserId: recipientId,
        recipientEmail: 'jean@test.fr',
        wishlistId,
        wishlistTitle: 'Liste Marie',
        ownerName: 'Marie',
        nbNewItems: 3,
        eventId: christmasId,
        eventTitle: 'Noël',
      }),
      notificationRow({
        recipientUserId: recipientId,
        recipientEmail: 'jean@test.fr',
        wishlistId,
        wishlistTitle: 'Liste Marie',
        ownerName: 'Marie',
        nbNewItems: 3,
        eventId: christmasId,
        eventTitle: 'Noël',
      }),
      notificationRow({
        recipientUserId: recipientId,
        recipientEmail: 'jean@test.fr',
        wishlistId,
        wishlistTitle: 'Liste Marie',
        ownerName: 'Marie',
        nbNewItems: 3,
        eventId: birthdayId,
        eventTitle: 'Anniversaire',
      }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'jean@test.fr',
      subject: 'Marie a ajouté des souhaits',
      context: {
        updates: [
          {
            ownerName: 'Marie',
            wishlistTitle: 'Liste Marie',
            wishlistUrl: `https://app/wishlists/${wishlistId}`,
            nbItems: 3,
            eventTitles: ['Noël', 'Anniversaire'],
          },
        ],
      },
    });
  });

  it('should only mention events the recipient attends', async () => {
    const wishlistId = uuid();
    const jeanId = uuid();
    const paulId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({
        recipientUserId: jeanId,
        recipientEmail: 'jean@test.fr',
        wishlistId,
        ownerName: 'Marie',
        eventTitle: 'Noël',
      }),
      notificationRow({
        recipientUserId: jeanId,
        recipientEmail: 'jean@test.fr',
        wishlistId,
        ownerName: 'Marie',
        eventTitle: 'Anniversaire',
      }),
      notificationRow({
        recipientUserId: paulId,
        recipientEmail: 'paul@test.fr',
        wishlistId,
        ownerName: 'Marie',
        eventTitle: 'Noël',
      }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'jean@test.fr',
      context: { updates: [{ eventTitles: ['Noël', 'Anniversaire'] }] },
    });
    expect(mailService.sendMail.mock.calls[1]?.[0]).toMatchObject({
      to: 'paul@test.fr',
      context: { updates: [{ eventTitles: ['Noël'] }] },
    });
  });

  it('should exclude the recipient own list from the recap', async () => {
    const marieId = uuid();
    const paulWishlistId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({
        recipientUserId: marieId,
        recipientEmail: 'marie@test.fr',
        ownerId: marieId,
        ownerName: 'Marie',
        wishlistTitle: 'Liste Marie',
      }),
      notificationRow({
        recipientUserId: marieId,
        recipientEmail: 'marie@test.fr',
        wishlistId: paulWishlistId,
        ownerName: 'Paul',
        wishlistTitle: 'Liste Paul',
        nbNewItems: 1,
      }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({
      to: 'marie@test.fr',
      subject: 'Paul a ajouté des souhaits',
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
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({ recipientUserId: ownerId, recipientEmail: 'marie@test.fr', ownerId }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(receiptRepository.claim).not.toHaveBeenCalled();
  });

  it('should send one email per recipient', async () => {
    const wishlistId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({ recipientUserId: uuid(), recipientEmail: 'jean@test.fr', wishlistId, ownerName: 'Marie' }),
      notificationRow({ recipientUserId: uuid(), recipientEmail: 'paul@test.fr', wishlistId, ownerName: 'Marie' }),
    ]);

    await useCase.execute(now);

    expect(mailService.sendMail).toHaveBeenCalledTimes(2);
    expect(mailService.sendMail.mock.calls[0]?.[0]).toMatchObject({ to: 'jean@test.fr' });
    expect(mailService.sendMail.mock.calls[1]?.[0]).toMatchObject({ to: 'paul@test.fr' });
  });

  it('should skip a recipient whose digest was already claimed', async () => {
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([notificationRow()]);
    receiptRepository.claim.mockResolvedValueOnce(false);

    await useCase.execute(now);

    expect(mailService.sendMail).not.toHaveBeenCalled();
    expect(receiptRepository.release).not.toHaveBeenCalled();
  });

  it('should release the claim when enqueueing the mail fails', async () => {
    const recipientId = uuid();
    itemRepository.findNewItemNotifications.mockResolvedValueOnce([
      notificationRow({ recipientUserId: recipientId, recipientEmail: 'jean@test.fr' }),
    ]);
    mailService.sendMail.mockRejectedValueOnce(new Error('queue down'));

    await useCase.execute(now);

    expect(receiptRepository.release).toHaveBeenCalledWith({ userId: recipientId, digestDate });
  });

  it('should swallow errors from fetching new items', async () => {
    itemRepository.findNewItemNotifications.mockRejectedValueOnce(new Error('db down'));

    await expect(useCase.execute(now)).resolves.toBeUndefined();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });
});

function notificationRow(overrides: Partial<NewItemNotificationRow> = {}): NewItemNotificationRow {
  return {
    wishlistId: uuid(),
    wishlistTitle: 'Liste',
    ownerId: uuid(),
    ownerName: 'Jean',
    nbNewItems: 2,
    eventId: uuid(),
    eventTitle: 'Noël',
    recipientUserId: uuid(),
    recipientEmail: 'jean@test.fr',
    ...overrides,
  };
}
