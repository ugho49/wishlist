import { Injectable } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { Wishlist, WishlistRepository } from '@wishlist/api/wishlist'
import { EventId, UserId, WishlistId } from '@wishlist/common'
import { and, eq } from 'drizzle-orm'

import { PostgresUserRepository } from './user.repository'

@Injectable()
export class PostgresWishlistRepository implements WishlistRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(wishlistId: WishlistId): Promise<Wishlist | undefined> {
    const result = await this.databaseService.db.query.wishlist.findFirst({
      where: eq(schema.wishlist.id, wishlistId),
      with: { owner: true },
    })

    return result ? PostgresWishlistRepository.toModel(result) : undefined
  }

  async findByEvent(eventId: EventId): Promise<Wishlist[]> {
    const result = await this.databaseService.db.query.wishlist.findMany({
      where: (wishlist, { exists }) =>
        exists(
          this.databaseService.db
            .select()
            .from(schema.eventWishlist)
            .where(and(eq(schema.eventWishlist.eventId, eventId), eq(schema.eventWishlist.wishlistId, wishlist.id))),
        ),
      with: { owner: true },
    })

    return result.map(PostgresWishlistRepository.toModel)
  }

  async findByOwner(userId: UserId): Promise<Wishlist[]> {
    const result = await this.databaseService.db.query.wishlist.findMany({
      where: eq(schema.wishlist.ownerId, userId),
      with: { owner: true },
    })

    return result.map(PostgresWishlistRepository.toModel)
  }

  async save(wishlist: Wishlist, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client
      .insert(schema.wishlist)
      .values({
        id: wishlist.id,
        title: wishlist.title,
        description: wishlist.description,
        ownerId: wishlist.owner.id,
        hideItems: wishlist.hideItems,
        logoUrl: wishlist.logoUrl,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.wishlist.id,
        set: {
          title: wishlist.title,
          description: wishlist.description,
          ownerId: wishlist.owner.id,
          hideItems: wishlist.hideItems,
          logoUrl: wishlist.logoUrl,
          updatedAt: wishlist.updatedAt,
        },
      })
  }

  async delete(wishlistId: WishlistId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client.delete(schema.wishlist).where(eq(schema.wishlist.id, wishlistId))
  }

  static toModel(row: typeof schema.wishlist.$inferSelect & { owner: typeof schema.user.$inferSelect }): Wishlist {
    return new Wishlist({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      owner: PostgresUserRepository.toModel(row.owner),
      hideItems: row.hideItems,
      logoUrl: row.logoUrl ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
