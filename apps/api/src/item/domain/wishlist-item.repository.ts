import type { EventId, ItemId, UserId, WishlistId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';
import type { WishlistItem } from './wishlist-item.model';

export type TakenItemsScope = 'ALL' | 'UPCOMING' | 'PAST';

export type TakenGiftRecord = {
  item: WishlistItem;
  takenAt: Date;
  wishlistId: WishlistId;
  wishlistTitle: string;
  recipient: {
    id: UserId;
    firstName: string;
    lastName: string;
    pictureUrl?: string;
  };
  events: Array<{
    id: EventId;
    title: string;
    icon?: string;
    eventDate: Date;
  }>;
};

export interface NewItemsForEventWishlist {
  eventId: EventId;
  eventTitle: string;
  wishlistId: WishlistId;
  wishlistTitle: string;
  ownerId: UserId;
  ownerName: string;
  nbNewItems: number;
}

export interface WishlistItemRepository {
  newId(): ItemId;
  findById(id: ItemId): Promise<WishlistItem | undefined>;
  findByIds(ids: ItemId[]): Promise<WishlistItem[]>;
  findByIdOrFail(id: ItemId): Promise<WishlistItem>;
  findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]>;
  findByWishlistIds(wishlistIds: WishlistId[]): Promise<WishlistItem[]>;
  findAllNewItems(since: Date): Promise<NewItemsForEventWishlist[]>;
  findImportableItems(params: { userId: UserId; wishlistId: WishlistId }): Promise<WishlistItem[]>;
  findTakenByUser(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
    scope: TakenItemsScope;
  }): Promise<{ items: TakenGiftRecord[]; totalCount: number }>;
  save(item: WishlistItem, tx?: DrizzleTransaction): Promise<void>;
  delete(id: ItemId, tx?: DrizzleTransaction): Promise<void>;
}
