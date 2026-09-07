import type { EventId, ItemId, UserId, UserNotificationId, WishlistId } from '@wishlist/common';

import { UserNotificationType } from '../user-notification-type.enum';

export type UserNotificationProps = {
  id: UserNotificationId;
  userId: UserId;
  type: UserNotificationType;
  title: string;
  body: string;
  eventId?: EventId;
  wishlistId?: WishlistId;
  itemId?: ItemId;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class UserNotification {
  public readonly id: UserNotificationId;
  public readonly userId: UserId;
  public readonly type: UserNotificationType;
  public readonly title: string;
  public readonly body: string;
  public readonly eventId?: EventId;
  public readonly wishlistId?: WishlistId;
  public readonly itemId?: ItemId;
  public readonly readAt?: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserNotificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.title = props.title;
    this.body = props.body;
    this.eventId = props.eventId;
    this.wishlistId = props.wishlistId;
    this.itemId = props.itemId;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(params: {
    id: UserNotificationId;
    userId: UserId;
    type: UserNotificationType;
    title: string;
    body: string;
    eventId?: EventId;
    wishlistId?: WishlistId;
    itemId?: ItemId;
  }): UserNotification {
    const now = new Date();
    return new UserNotification({
      id: params.id,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      eventId: params.eventId,
      wishlistId: params.wishlistId,
      itemId: params.itemId,
      createdAt: now,
      updatedAt: now,
    });
  }

  get isRead(): boolean {
    return this.readAt !== undefined;
  }

  markRead(): UserNotification {
    if (this.readAt) {
      return this;
    }
    const now = new Date();
    return new UserNotification({
      ...this,
      readAt: now,
      updatedAt: now,
    });
  }
}
