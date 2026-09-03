import type { NewItemsForEventWishlist, WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { type EventId } from '@wishlist/common';
import { DateTime } from 'luxon';

import { FrontendRoutesService } from '../../../core/frontend-routes/frontend-routes.service';
import { MailService } from '../../../core/mail/mail.service';
import { MailTemplate } from '../../../core/mail/mail.type';
import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

type EventDigest = {
  eventId: EventId;
  eventTitle: string;
  updates: NewItemsForEventWishlist[];
};

@Injectable()
export class NotifyNewItemsUseCase {
  private readonly logger = new Logger(NotifyNewItemsUseCase.name);

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    private readonly mailService: MailService,
    private readonly frontendRoutes: FrontendRoutesService,
  ) {}

  async execute(): Promise<void> {
    try {
      const oneDayAgo = DateTime.now().minus({ days: 1 }).toJSDate();

      this.logger.log(`Fetching new items to send daily notification since "${oneDayAgo.toISOString()}" ...`);

      const rows = await this.itemRepository.findAllNewItems(oneDayAgo);

      if (rows.length === 0) {
        this.logger.log('No new items to send daily notification');
        return;
      }

      const digests = this.groupByEvent(rows);
      this.logger.log(`Found new items across ${digests.length} event(s) to send daily notification`);

      for (const digest of digests) {
        await this.notify(digest);
      }
    } catch (e) {
      this.logger.error('Fail to send new item notification', e);
    }
  }

  private async notify(digest: EventDigest) {
    try {
      this.logger.log(`Notifying event "${digest.eventId}" ...`, {
        eventId: digest.eventId,
        nbWishlists: digest.updates.length,
      });

      const recipients = await this.eventRepository.findEmailsToNotify(digest.eventId);

      if (recipients.length === 0) {
        this.logger.log(`No emails to notify for event ${digest.eventId}`);
        return;
      }

      const recapGroups = new Map<string, { emails: string[]; updates: NewItemsForEventWishlist[] }>();

      for (const recipient of recipients) {
        const updates = digest.updates.filter(update => update.ownerId !== recipient.userId);
        if (updates.length === 0) continue;

        const key = updates
          .map(update => update.wishlistId)
          .sort((a, b) => a.localeCompare(b))
          .join(',');
        const group = recapGroups.get(key);
        if (group) {
          group.emails.push(recipient.email);
        } else {
          recapGroups.set(key, { emails: [recipient.email], updates });
        }
      }

      if (recapGroups.size === 0) {
        this.logger.log(`No personalized recaps to send for event ${digest.eventId}`);
        return;
      }

      for (const group of recapGroups.values()) {
        this.logger.log(`Notifying ${group.emails.length} people for new items in event "${digest.eventId}" ...`, {
          eventId: digest.eventId,
        });

        await this.sendNotifyEmail({
          emails: group.emails,
          eventId: digest.eventId,
          eventTitle: digest.eventTitle,
          updates: group.updates,
        });
      }

      this.logger.log(`✅ New items notification sent successfully for event "${digest.eventId}"`);
    } catch (e) {
      this.logger.error(`Fail to notify new items for event ${digest.eventId}`, e);
    }
  }

  private async sendNotifyEmail(param: {
    emails: string[];
    eventId: EventId;
    eventTitle: string;
    updates: NewItemsForEventWishlist[];
  }) {
    await this.mailService.sendMail({
      to: param.emails,
      subject: `Nouveautés sur ${param.eventTitle}`,
      template: MailTemplate.NEW_ITEMS_REMINDER,
      context: {
        eventTitle: param.eventTitle,
        eventUrl: this.frontendRoutes.routes.event.byId(param.eventId),
        updates: param.updates.map(update => ({
          ownerName: update.ownerName,
          wishlistTitle: update.wishlistTitle,
          wishlistUrl: this.frontendRoutes.routes.wishlist.byId(update.wishlistId),
          nbItems: update.nbNewItems,
        })),
      },
    });
  }

  private groupByEvent(rows: NewItemsForEventWishlist[]): EventDigest[] {
    const byEvent = new Map<EventId, EventDigest>();

    for (const row of rows) {
      const existing = byEvent.get(row.eventId);
      if (existing) {
        existing.updates.push(row);
      } else {
        byEvent.set(row.eventId, {
          eventId: row.eventId,
          eventTitle: row.eventTitle,
          updates: [row],
        });
      }
    }

    return [...byEvent.values()];
  }
}
