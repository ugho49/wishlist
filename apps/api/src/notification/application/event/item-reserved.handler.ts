import type { UserNotificationRepository } from '../../domain/repository/user-notification.repository';

import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, type IEventHandler } from '@nestjs/cqrs';
import { type UserId } from '@wishlist/common';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { ItemReservedEvent } from '../../../item/domain/event/item-reserved.event';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserNotification } from '../../domain/model/user-notification.model';
import { UserNotificationType } from '../../domain/user-notification-type.enum';

@EventsHandler(ItemReservedEvent)
export class ItemReservedHandler implements IEventHandler<ItemReservedEvent> {
  private readonly logger = new Logger(ItemReservedHandler.name);

  constructor(
    @Inject(REPOSITORIES.USER_NOTIFICATION)
    private readonly userNotificationRepository: UserNotificationRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async handle(event: ItemReservedEvent): Promise<void> {
    this.logger.log('Item reserved event received', { itemId: event.itemId, actorId: event.actorId });

    if (event.eventIds.length === 0) {
      return;
    }

    const events = await this.eventRepository.findByIds(event.eventIds);
    const recipientIds = new Set<UserId>();

    for (const linkedEvent of events) {
      for (const attendee of linkedEvent.attendees) {
        const userId = attendee.user?.id;
        if (!userId) continue;
        if (userId === event.actorId) continue;
        if (event.hideItems && (userId === event.ownerId || userId === event.coOwnerId)) continue;
        recipientIds.add(userId);
      }
    }

    const notifications = [...recipientIds].map(userId =>
      UserNotification.create({
        id: this.userNotificationRepository.newId(),
        userId,
        type: UserNotificationType.ITEM_RESERVED,
        title: 'Souhait réservé',
        body: `${event.actorFirstName} a réservé « ${event.itemName} » sur la liste « ${event.wishlistTitle} »`,
        eventId: events[0]?.id,
        wishlistId: event.wishlistId,
        itemId: event.itemId,
      }),
    );

    await this.userNotificationRepository.saveAll(notifications);
  }
}
