import type { DrizzleDatabase } from '../../core/database/database.factory';
import type { DrizzleTransaction } from '../../core/database/transaction-manager';

import { schema } from '@wishlist/api-drizzle';
import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { and, count, desc, eq, inArray, or, sql } from 'drizzle-orm';

import {
  type UserMergeAttendance,
  type UserMergeFootprint,
  type UserMergeRepository,
  type UserMergeTransfer,
  type UserMergeWishlist,
} from '../../user/domain/repository/user-merge.repository';

@Injectable()
export class PostgresUserMergeRepository implements UserMergeRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findFootprint(userId: UserId): Promise<UserMergeFootprint> {
    const [attendances, wishlists, reservedItemCount] = await Promise.all([
      this.findAttendances(userId),
      this.findWishlists(userId),
      this.countReservedItems(userId),
    ]);

    return { attendances, wishlists, reservedItemCount };
  }

  async transfer(transfer: UserMergeTransfer, tx: DrizzleTransaction): Promise<void> {
    const { sourceUserId, targetUserId } = transfer;
    const now = new Date();

    // Free the (user_id, provider) slot before moving the replacing source account
    if (transfer.replacedTargetAccountIds.length > 0) {
      await tx.delete(schema.userAccount).where(inArray(schema.userAccount.id, transfer.replacedTargetAccountIds));
    }

    if (transfer.accountIds.length > 0) {
      await tx
        .update(schema.userAccount)
        .set({ userId: targetUserId, updatedAt: now })
        .where(and(inArray(schema.userAccount.id, transfer.accountIds), eq(schema.userAccount.userId, sourceUserId)));
    }

    if (transfer.attendeeIds.length > 0) {
      await tx
        .update(schema.eventAttendee)
        .set({ userId: targetUserId })
        .where(
          and(inArray(schema.eventAttendee.id, transfer.attendeeIds), eq(schema.eventAttendee.userId, sourceUserId)),
        );
    }

    for (const { attendeeId, role } of transfer.attendeeRoleUpdates) {
      await tx.update(schema.eventAttendee).set({ role }).where(eq(schema.eventAttendee.id, attendeeId));
    }

    for (const { secretSantaUserId, attendeeId } of transfer.secretSantaUserMoves) {
      await tx
        .update(schema.secretSantaUser)
        .set({ attendeeId, updatedAt: now })
        .where(eq(schema.secretSantaUser.id, secretSantaUserId));
    }

    if (transfer.ownedWishlistIds.length > 0) {
      await tx
        .update(schema.wishlist)
        .set({
          ownerId: targetUserId,
          // An owner cannot co-own their own list (chk_co_owner)
          coOwnerId: sql`CASE WHEN ${schema.wishlist.coOwnerId} = ${targetUserId} THEN NULL ELSE ${schema.wishlist.coOwnerId} END`,
        })
        .where(and(inArray(schema.wishlist.id, transfer.ownedWishlistIds), eq(schema.wishlist.ownerId, sourceUserId)));
    }

    if (transfer.coOwnedWishlistIds.length > 0) {
      await tx
        .update(schema.wishlist)
        .set({ coOwnerId: targetUserId })
        .where(
          and(inArray(schema.wishlist.id, transfer.coOwnedWishlistIds), eq(schema.wishlist.coOwnerId, sourceUserId)),
        );
    }

    if (transfer.transferReservations) {
      // A reservation both users hold stays the target's one (primary key: item_id, user_id)
      await tx
        .delete(schema.itemTaker)
        .where(
          and(
            eq(schema.itemTaker.userId, sourceUserId),
            inArray(
              schema.itemTaker.itemId,
              tx
                .select({ itemId: schema.itemTaker.itemId })
                .from(schema.itemTaker)
                .where(eq(schema.itemTaker.userId, targetUserId)),
            ),
          ),
        );

      await tx.update(schema.itemTaker).set({ userId: targetUserId }).where(eq(schema.itemTaker.userId, sourceUserId));
    }
  }

  private async findAttendances(userId: UserId): Promise<UserMergeAttendance[]> {
    const rows = await this.db
      .select({
        attendeeId: schema.eventAttendee.id,
        role: schema.eventAttendee.role,
        eventId: schema.event.id,
        eventTitle: schema.event.title,
        eventIcon: schema.event.icon,
        eventDate: schema.event.eventDate,
        secretSantaUserId: schema.secretSantaUser.id,
      })
      .from(schema.eventAttendee)
      .innerJoin(schema.event, eq(schema.event.id, schema.eventAttendee.eventId))
      // An attendee belongs to a single event, which has at most one secret santa
      .leftJoin(schema.secretSantaUser, eq(schema.secretSantaUser.attendeeId, schema.eventAttendee.id))
      .where(eq(schema.eventAttendee.userId, userId))
      .orderBy(desc(schema.event.eventDate), schema.event.title);

    return rows.map(row => ({
      attendeeId: row.attendeeId,
      eventId: row.eventId,
      eventTitle: row.eventTitle,
      eventIcon: row.eventIcon ?? undefined,
      eventDate: new Date(row.eventDate),
      role: row.role,
      secretSantaUserId: row.secretSantaUserId ?? undefined,
    }));
  }

  private async findWishlists(userId: UserId): Promise<UserMergeWishlist[]> {
    const wishlists = await this.db.query.wishlist.findMany({
      where: or(eq(schema.wishlist.ownerId, userId), eq(schema.wishlist.coOwnerId, userId)),
      with: { eventWishlists: true },
      orderBy: [desc(schema.wishlist.createdAt)],
    });

    if (wishlists.length === 0) return [];

    const itemCounts = await this.db
      .select({ wishlistId: schema.item.wishlistId, count: count() })
      .from(schema.item)
      .where(
        inArray(
          schema.item.wishlistId,
          wishlists.map(wishlist => wishlist.id),
        ),
      )
      .groupBy(schema.item.wishlistId);
    const itemCountByWishlist = new Map(itemCounts.map(row => [row.wishlistId, row.count]));

    return wishlists.map(wishlist => ({
      id: wishlist.id,
      title: wishlist.title,
      logoUrl: wishlist.logoUrl ?? undefined,
      ownerId: wishlist.ownerId,
      coOwnerId: wishlist.coOwnerId ?? undefined,
      eventIds: wishlist.eventWishlists.map(eventWishlist => eventWishlist.eventId),
      itemCount: itemCountByWishlist.get(wishlist.id) ?? 0,
    }));
  }

  private async countReservedItems(userId: UserId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(schema.itemTaker)
      .where(eq(schema.itemTaker.userId, userId));

    return row?.count ?? 0;
  }
}
