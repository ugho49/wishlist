import type { EventId, UserId, WishlistId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';
import type { Wishlist } from './wishlist.model';

export interface WishlistRepository {
  newId(): WishlistId;
  findById(wishlistId: WishlistId): Promise<Wishlist | undefined>;
  findByIdOrFail(wishlistId: WishlistId): Promise<Wishlist>;
  findByIds(wishlistIds: WishlistId[]): Promise<Wishlist[]>;
  findByEvent(eventId: EventId): Promise<Wishlist[]>;
  /** The lists linked to one of these events with at least one item added by their managers (not suggested). */
  findFilledByEventIds(eventIds: EventId[]): Promise<Wishlist[]>;
  findByUserPaginated(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
  }): Promise<{ wishlists: Wishlist[]; totalCount: number }>;
  hasAccess(params: { wishlistId: WishlistId; userId: UserId }): Promise<boolean>;
  save(wishlist: Wishlist, tx?: DrizzleTransaction): Promise<void>;
  delete(wishlistId: WishlistId, tx?: DrizzleTransaction): Promise<void>;
}
