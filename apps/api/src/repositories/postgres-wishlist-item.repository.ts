import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { NewItemsForWishlist, WishlistItem, WishlistItemRepository } from '@wishlist/api/item'
import { schema } from '@wishlist/api-drizzle'
import { ItemId, UserId, uuid, WishlistId } from '@wishlist/common'
import { and, eq, gt, inArray, isNull, ne, sql } from 'drizzle-orm'
import { DateTime } from 'luxon'

import { PostgresUserRepository } from './postgres-user.repository'

@Injectable()
export class PostgresWishlistItemRepository implements WishlistItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): ItemId {
    return uuid() as ItemId
  }

  async findById(id: ItemId): Promise<WishlistItem | undefined> {
    const result = await this.databaseService.db.query.item.findFirst({
      where: eq(schema.item.id, id),
      with: { taker: true },
    })

    return result ? PostgresWishlistItemRepository.toModel(result) : undefined
  }

  async findByIds(ids: ItemId[]): Promise<WishlistItem[]> {
    if (ids.length === 0) return []

    const result = await this.databaseService.db.query.item.findMany({
      where: inArray(schema.item.id, ids),
      with: { taker: true },
    })

    return result.map(PostgresWishlistItemRepository.toModel)
  }

  async findByIdOrFail(id: ItemId): Promise<WishlistItem> {
    const result = await this.findById(id)
    if (!result) throw new NotFoundException('Item not found')
    return result
  }

  async findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]> {
    const result = await this.databaseService.db.query.item.findMany({
      where: eq(schema.item.wishlistId, wishlistId),
      with: { taker: true },
    })

    return result.map(PostgresWishlistItemRepository.toModel)
  }

  async findAllNewItems(since: Date): Promise<NewItemsForWishlist[]> {
    const rows = await this.databaseService.db
      .select({
        wishlistId: schema.item.wishlistId,
        wishlistTitle: schema.wishlist.title,
        ownerId: schema.wishlist.ownerId,
        ownerName: sql<string>`CONCAT(${schema.user.firstName}, ' ', ${schema.user.lastName})`,
        nbNewItems: sql<number>`COUNT(${schema.item.id})`,
      })
      .from(schema.item)
      .innerJoin(schema.wishlist, eq(schema.wishlist.id, schema.item.wishlistId))
      .innerJoin(schema.user, eq(schema.user.id, schema.wishlist.ownerId))
      .where(and(eq(schema.item.isSuggested, false), gt(schema.item.createdAt, since)))
      .groupBy(
        schema.item.wishlistId,
        schema.wishlist.title,
        schema.wishlist.ownerId,
        schema.user.firstName,
        schema.user.lastName,
      )

    return rows.map(row => ({
      wishlistId: row.wishlistId,
      wishlistTitle: row.wishlistTitle,
      ownerId: row.ownerId,
      ownerName: row.ownerName,
      nbNewItems: row.nbNewItems,
    }))
  }

  async findImportableItems(params: { userId: UserId; wishlistId: WishlistId }): Promise<WishlistItem[]> {
    const { userId, wishlistId } = params
    const twoMonthsAgo = DateTime.now().minus({ months: 2 }).toJSDate()

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
      .having(sql`MAX(${schema.event.eventDate}) < ${twoMonthsAgo}`)
      .as('eligible_wishlists')

    // Find items that already exist in the target wishlist (with importSourceId)
    const alreadyImportedItemsSubquery = this.databaseService.db
      .select({
        importSourceId: schema.item.importSourceId,
      })
      .from(schema.item)
      .where(and(eq(schema.item.wishlistId, wishlistId), sql`${schema.item.importSourceId} IS NOT NULL`))
      .as('already_imported_items')

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
          isNull(schema.item.takerId),
          isNull(alreadyImportedItemsSubquery.importSourceId),
        ),
      )
      .orderBy(schema.item.createdAt)

    return result.map(row => PostgresWishlistItemRepository.toModel({ ...row.item, taker: null }))
  }

  async save(item: WishlistItem, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client
      .insert(schema.item)
      .values({
        id: item.id,
        wishlistId: item.wishlistId,
        name: item.name,
        description: item.description,
        url: item.url,
        score: item.score,
        isSuggested: item.isSuggested,
        takerId: item.takenBy?.id,
        takenAt: item.takenAt,
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
          takerId: item.takenBy?.id ?? null,
          takenAt: item.takenAt ?? null,
          updatedAt: item.updatedAt,
        },
      })
  }

  async delete(id: ItemId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db
    await client.delete(schema.item).where(eq(schema.item.id, id))
  }

  static toModel(
    row: typeof schema.item.$inferSelect & {
      taker: typeof schema.user.$inferSelect | null
    },
  ): WishlistItem {
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
      takenBy: row.taker ? PostgresUserRepository.toModel(row.taker) : undefined,
      takenAt: row.takenAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
