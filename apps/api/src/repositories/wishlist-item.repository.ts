import { Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { NewItemsForWishlist, WishlistItem, WishlistItemRepository } from '@wishlist/api/item'
import { ItemId, WishlistId } from '@wishlist/common'
import { and, eq, gt, sql } from 'drizzle-orm'

import { PostgresUserRepository } from './user.repository'

@Injectable()
export class PostgresWishlistItemRepository implements WishlistItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: ItemId): Promise<WishlistItem | undefined> {
    const result = await this.databaseService.db.query.item.findFirst({
      where: eq(schema.item.id, id),
      with: { taker: true },
    })

    return result ? PostgresWishlistItemRepository.toModel(result) : undefined
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
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.item.id,
        set: {
          name: item.name,
          description: item.description ?? null,
          url: item.url ?? null,
          score: item.score ?? null,
          isSuggested: item.isSuggested,
          takerId: item.takenBy?.id ?? null,
          takenAt: item.takenAt ?? null,
          pictureUrl: item.imageUrl ?? null,
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
