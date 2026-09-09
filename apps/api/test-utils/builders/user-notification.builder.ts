import type { EventId, ItemId, UserId, UserNotificationId, WishlistId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { UserNotification } from '../../src/notification/domain/model/user-notification.model';
import { UserNotificationType } from '../../src/notification/domain/user-notification-type.enum';

type UserNotificationBuilderData = {
  userId: UserId;
  type: UserNotificationType;
  title: string;
  body: string;
  eventId?: EventId;
  wishlistId?: WishlistId;
  itemId?: ItemId;
};

export class UserNotificationBuilder {
  private readonly data: UserNotificationBuilderData = {
    userId: uuid() as UserId,
    type: UserNotificationType.NEW_GUEST,
    title: 'Nouvel invité',
    body: 'Marie a rejoint Noël',
  };

  withUserId(userId: UserId): this {
    this.data.userId = userId;
    return this;
  }

  withType(type: UserNotificationType): this {
    this.data.type = type;
    return this;
  }

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withBody(body: string): this {
    this.data.body = body;
    return this;
  }

  withEventId(eventId: EventId): this {
    this.data.eventId = eventId;
    return this;
  }

  build(): UserNotification {
    return UserNotification.create({
      id: uuid() as UserNotificationId,
      userId: this.data.userId,
      type: this.data.type,
      title: this.data.title,
      body: this.data.body,
      eventId: this.data.eventId,
      wishlistId: this.data.wishlistId,
      itemId: this.data.itemId,
    });
  }
}
