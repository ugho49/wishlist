import { Injectable, NotFoundException } from '@nestjs/common';
import { schema } from '@wishlist/api-drizzle';
import { type ItemId, type UserId, uuid, type WishlistId } from '@wishlist/common';
import { and, eq, gt, inArray, isNull, lt, max, ne, notExists, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';

import { DatabaseService } from '../../core/database/database.service';
import { type DrizzleTransaction } from '../../core/database/transaction-manager';
import { WishlistItem } from '../../item/domain/wishlist-item.model';
import { type NewItemsForEventWishlist, type WishlistItemRepository } from '../../item/domain/wishlist-item.repository';

type ItemRowWithTakers = typeof schema.item.$inferSelect & {
  takers: (typeof schema.itemTaker.$inferSelect)[];
};

@Injectable()
export class PostgresWishlistItemRepository implements WishlistItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): ItemId {
    return uuid() as ItemId;
  }

  async findById(id: ItemId): Promise<WishlistItem | undefined> {
    const result = await this.databaseService.db.query.item.findFirst({
      where: eq(schema.item.id, id),
      with: { takers: true },
    });

    return result ? PostgresWishlistItemRepository.toModel(result) : undefined;
  }

  async findByIds(ids: ItemId[]): Promise<WishlistItem[]> {
    if (ids.length === 0) return [];

    const result = await this.databaseService.db.query.item.findMany({
      where: inArray(schema.item.id, ids),
      with: { takers: true },
    });

    return result.map(PostgresWishlistItemRepository.toModel);
  }

  async findByIdOrFail(id: ItemId): Promise<WishlistItem> {
    const result = await this.findById(id);
    if (!result) throw new NotFoundException('Item not found');
    return result;
  }

  async findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]> {
    const result = await this.databaseService.db.query.item.findMany({
      where: eq(schema.item.wishlistId, wishlistId),
      with: { takers: true },
    });

    return result.map(PostgresWishlistItemRepository.toModel);
  }

  async findByWishlistIds(wishlistIds: WishlistId[]): Promise<WishlistItem[]> {
    const result = await this.databaseService.db.query.item.findMany({
      where: inArray(schema.item.wishlistId, wishlistIds),
      with: { takers: true },
    });

    return result.map(PostgresWishlistItemRepository.toModel);
  }

  async findAllNewItems(since: Date): Promise<NewItemsForEventWishlist[]> {
    const rows = await this.databaseService.db
      .select({
        eventId: schema.event.id,
        eventTitle: schema.event.title,
        wishlistId: schema.item.wishlistId,
        wishlistTitle: schema.wishlist.title,
        ownerId: schema.wishlist.ownerId,
        ownerName: sql<string>`CONCAT(${schema.user.firstName}, ' ', ${schema.user.lastName})`,
        nbNewItems: sql<number>`COUNT(${schema.item.id})`,
      })
      .from(schema.item)
      .innerJoin(schema.wishlist, eq(schema.wishlist.id, schema.item.wishlistId))
      .innerJoin(schema.user, eq(schema.user.id, schema.wishlist.ownerId))
      .innerJoin(schema.eventWishlist, eq(schema.eventWishlist.wishlistId, schema.wishlist.id))
      .innerJoin(schema.event, eq(schema.event.id, schema.eventWishlist.eventId))
      .where(and(eq(schema.item.isSuggested, false), gt(schema.item.createdAt, since)))
      .groupBy(
        schema.event.id,
        schema.event.title,
        schema.item.wishlistId,
        schema.wishlist.title,
        schema.wishlist.ownerId,
        schema.user.firstName,
        schema.user.lastName,
      );

    return rows.map(row => ({
      eventId: row.eventId,
      eventTitle: row.eventTitle,
      wishlistId: row.wishlistId,
      wishlistTitle: row.wishlistTitle,
      ownerId: row.ownerId,
      ownerName: row.ownerName,
      nbNewItems: Number(row.nbNewItems),
    }));
  }

  async findImportableItems(params: { userId: UserId; wishlistId: WishlistId }): Promise<WishlistItem[]> {
    const { userId, wishlistId } = params;
    const twoMonthsAgo = DateTime.now().minus({ months: 2 }).toFormat('yyyy-MM-dd');

    // Find all wishlists of the user where all linked events are finished more than 2 months ago
    const eligibleWishlistsSubquery = this.databaseService.db
      .select({
        wishlistId: schema.eventWishlist.wishlistId,
      })
      .from(schema.eventWishlist)
      .innerJoin(schema.wishlist, eq(schema.wishlist.id, schema.eventWishlist.wishlistId))
      .innerJoin(schema.event, eq(schema.event.id, schema.eventWishlist.eventId))
      .where(
        and(
          ne(schema.wishlist.id, wishlistId),
          eq(schema.wishlist.ownerId, userId),
          eq(schema.wishlist.hideItems, true),
        ),
      )
      .groupBy(schema.eventWishlist.wishlistId)
      .having(lt(max(schema.event.eventDate), twoMonthsAgo))
      .as('eligible_wishlists');

    // Find items that already exist in the target wishlist (with importSourceId)
    const alreadyImportedItemsSubquery = this.databaseService.db
      .select({
        importSourceId: schema.item.importSourceId,
      })
      .from(schema.item)
      .where(and(eq(schema.item.wishlistId, wishlistId), sql`${schema.item.importSourceId} IS NOT NULL`))
      .as('already_imported_items');

    // Get all items from these wishlists that are not taken, not suggested, and not already imported
    const result = await this.databaseService.db
      .select({
        item: schema.item,
      })
      .from(schema.item)
      .innerJoin(eligibleWishlistsSubquery, eq(schema.item.wishlistId, eligibleWishlistsSubquery.wishlistId))
      .leftJoin(alreadyImportedItemsSubquery, eq(schema.item.id, alreadyImportedItemsSubquery.importSourceId))
      .where(
        and(
          eq(schema.item.isSuggested, false),
          isNull(alreadyImportedItemsSubquery.importSourceId),
          notExists(
            this.databaseService.db.select().from(schema.itemTaker).where(eq(schema.itemTaker.itemId, schema.item.id)),
          ),
        ),
      )
      .orderBy(schema.item.createdAt);

    return result.map(row => PostgresWishlistItemRepository.toModel({ ...row.item, takers: [] }));
  }

  async save(item: WishlistItem, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;

    await client.transaction(async subTx => {
      await subTx
        .insert(schema.item)
        .values({
          id: item.id,
          wishlistId: item.wishlistId,
          name: item.name,
          description: item.description,
          url: item.url,
          score: item.score,
          isSuggested: item.isSuggested,
          pictureUrl: item.imageUrl,
          importSourceId: item.importSourceId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
        .onConflictDoUpdate({
          target: schema.item.id,
          set: {
            name: item.name,
            description: item.description ?? null,
            importSourceId: item.importSourceId ?? null,
            url: item.url ?? null,
            pictureUrl: item.imageUrl ?? null,
            score: item.score ?? null,
            isSuggested: item.isSuggested,
            updatedAt: item.updatedAt,
          },
        });

      await subTx.delete(schema.itemTaker).where(eq(schema.itemTaker.itemId, item.id));

      if (item.takers.length > 0) {
        await subTx.insert(schema.itemTaker).values(
          item.takers.map(taker => ({
            itemId: item.id,
            userId: taker.userId,
            takenAt: taker.takenAt,
          })),
        );
      }
    });
  }

  async delete(id: ItemId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db;
    await client.delete(schema.item).where(eq(schema.item.id, id));
  }

  static toModel(row: ItemRowWithTakers): WishlistItem {
    return new WishlistItem({
      id: row.id,
      importSourceId: row.importSourceId ?? undefined,
      wishlistId: row.wishlistId,
      name: row.name,
      description: row.description ?? undefined,
      url: row.url ?? undefined,
      score: row.score ?? undefined,
      isSuggested: row.isSuggested,
      imageUrl: row.pictureUrl ?? undefined,
      takers: row.takers.map(taker => ({
        userId: taker.userId,
        takenAt: taker.takenAt,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
