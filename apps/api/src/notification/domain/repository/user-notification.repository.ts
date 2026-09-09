import type { UserId, UserNotificationId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserNotification } from '../model/user-notification.model';

export interface UserNotificationRepository {
  newId(): UserNotificationId;
  findByIdForUser(params: { id: UserNotificationId; userId: UserId }): Promise<UserNotification | undefined>;
  findByUserIdPaginated(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
  }): Promise<{ notifications: UserNotification[]; totalCount: number }>;
  countUnread(userId: UserId): Promise<number>;
  save(notification: UserNotification, tx?: DrizzleTransaction): Promise<void>;
  saveAll(notifications: UserNotification[], tx?: DrizzleTransaction): Promise<void>;
  markAllRead(userId: UserId): Promise<void>;
}
