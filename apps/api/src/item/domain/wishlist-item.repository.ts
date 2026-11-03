import type { EventId, ItemId, UserId, WishlistId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';
import type { WishlistItem } from './wishlist-item.model';

export interface NewItemNotificationRow {
  wishlistId: WishlistId;
  wishlistTitle: string;
  ownerId: UserId;
  ownerName: string;
  nbNewItems: number;
  eventId: EventId;
  eventTitle: string;
  recipientUserId: UserId;
  recipientEmail: string;
}

export type ReservedItemEvent = {
  id: EventId;
  title: string;
  eventDate: string;
};

export type ReservedItemTaker = {
  userId: UserId;
  firstName: string;
  lastName: string;
  pictureUrl?: string;
  takenAt: Date;
};

export type ReservedItemPeriod = 'all' | 'reserved' | 'past';

export type ReservedItem = {
  id: ItemId;
  name: string;
  description?: string;
  url?: string;
  score?: number;
  pictureUrl?: string;
  takenAt: Date;
  wishlistId: WishlistId;
  wishlistTitle: string;
  ownerFirstName: string;
  ownerLastName: string;
  events: ReservedItemEvent[];
  takers: ReservedItemTaker[];
};

export interface WishlistItemRepository {
  newId(): ItemId;
  findById(id: ItemId): Promise<WishlistItem | undefined>;
  findByIds(ids: ItemId[]): Promise<WishlistItem[]>;
  findByIdOrFail(id: ItemId): Promise<WishlistItem>;
  findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]>;
  findByWishlistIds(wishlistIds: WishlistId[]): Promise<WishlistItem[]>;
  findNewItemNotifications(since: Date): Promise<NewItemNotificationRow[]>;
  findImportableItems(params: { userId: UserId; wishlistId: WishlistId }): Promise<WishlistItem[]>;
  findReservedByUserPaginated(params: {
    userId: UserId;
    period: ReservedItemPeriod;
    pagination: { take: number; skip: number };
  }): Promise<{ items: ReservedItem[]; totalCount: number }>;
  save(item: WishlistItem, tx?: DrizzleTransaction): Promise<void>;
  delete(id: ItemId, tx?: DrizzleTransaction): Promise<void>;
}
