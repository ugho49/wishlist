import type { ItemDigestReceiptRepository } from '../../domain/item-digest-receipt.repository';
import type { NewItemNotificationRow, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { type EventId, type UserId, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';
import { DateTime } from 'luxon';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';

const DIGEST_TIME_ZONE = 'Europe/Paris';

type WishlistUpdate = {
  wishlistId: WishlistId;
  wishlistTitle: string;
  ownerName: string;
  nbNewItems: number;
  events: Array<{ id: EventId; title: string }>;
};

type RecipientDigest = {
  userId: UserId;
  email: string;
  updates: WishlistUpdate[];
};

@Injectable()
export class NotifyNewItemsUseCase {
  private readonly logger = getLogger(NotifyNewItemsUseCase.name);

  constructor(
    private readonly itemRepository: WishlistItemRepository,
    private readonly receiptRepository: ItemDigestReceiptRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(now: DateTime = DateTime.now()): Promise<void> {
    try {
      const since = now.minus({ days: 1 }).toJSDate();
      const digestDate = now.setZone(DIGEST_TIME_ZONE).toISODate();

      if (!digestDate) {
        this.logger.error('Unable to resolve the Paris digest date');
        return;
      }

      this.logger.info(`Fetching new items to send daily notification since "${since.toISOString()}" ...`);

      const rows = await this.itemRepository.findNewItemNotifications(since);
      const digests = this.groupByRecipient(rows);

      if (digests.length === 0) {
        this.logger.info('No new items to send daily notification');
        return;
      }

      this.logger.info(`Found new items for ${digests.length} recipient(s) to send daily notification`);

      for (const digest of digests) {
        await this.notify(digest, digestDate);
      }
    } catch (error) {
      this.logger.error('Fail to send new item notification', { error: error });
    }
  }

  private async notify(digest: RecipientDigest, digestDate: string) {
    const claimed = await this.receiptRepository.claim({ userId: digest.userId, digestDate });

    if (!claimed) {
      this.logger.info(`New items digest already sent to user ${digest.userId} on ${digestDate}`);
      return;
    }

    try {
      await this.sendNotifyEmail(digest, digestDate);
      this.logger.info(`New items digest queued for user ${digest.userId}`);
    } catch (error) {
      this.logger.error(`Fail to queue new items digest for user ${digest.userId}`, { error: error });
      try {
        await this.receiptRepository.release({ userId: digest.userId, digestDate });
      } catch (releaseError) {
        this.logger.error(`Fail to release new items digest claim for user ${digest.userId}`, { error: releaseError });
      }
    }
  }

  private async sendNotifyEmail(digest: RecipientDigest, digestDate: string) {
    await this.mailService.sendMail({
      to: digest.email,
      subject: subjectFor(digest.updates),
      template: MailTemplate.NEW_ITEMS_REMINDER,
      idempotencyKey: `new-items/${digest.userId}/${digestDate}`,
      context: {
        updates: digest.updates.map(update => ({
          ownerName: update.ownerName,
          wishlistTitle: update.wishlistTitle,
          wishlistUrl: this.frontendRoutes.routes.wishlist.byId(update.wishlistId),
          nbItems: update.nbNewItems,
          eventTitles: update.events.map(event => event.title),
        })),
      },
    });
  }

  private groupByRecipient(rows: NewItemNotificationRow[]): RecipientDigest[] {
    const byRecipient = new Map<UserId, RecipientDigest>();

    for (const row of rows) {
      if (row.recipientUserId === row.ownerId) continue;

      let digest = byRecipient.get(row.recipientUserId);
      if (!digest) {
        digest = { userId: row.recipientUserId, email: row.recipientEmail, updates: [] };
        byRecipient.set(row.recipientUserId, digest);
      }

      let update = digest.updates.find(candidate => candidate.wishlistId === row.wishlistId);
      if (!update) {
        update = {
          wishlistId: row.wishlistId,
          wishlistTitle: row.wishlistTitle,
          ownerName: row.ownerName,
          nbNewItems: row.nbNewItems,
          events: [],
        };
        digest.updates.push(update);
      }

      if (!update.events.some(event => event.id === row.eventId)) {
        update.events.push({ id: row.eventId, title: row.eventTitle });
      }
    }

    return [...byRecipient.values()];
  }
}

function subjectFor(updates: WishlistUpdate[]): string {
  const ownerNames = new Set(updates.map(update => update.ownerName));
  if (ownerNames.size === 1) {
    return `${updates[0]?.ownerName ?? 'Un proche'} a ajouté des souhaits`;
  }

  return 'Nouveautés sur les listes';
}
