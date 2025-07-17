import { Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { Wishlist, WishlistRepository } from '@wishlist/api/wishlist'
import { EventId, UserId, WishlistId } from '@wishlist/common'
import { and, eq, exists, or } from 'drizzle-orm'

import { PostgresUserRepository } from './user.repository'
import { PostgresWishlistItemRepository } from './wishlist-item.repository'

@Injectable()
export class PostgresWishlistRepository implements WishlistRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(wishlistId: WishlistId): Promise<Wishlist | undefined> {
    const result = await this.databaseService.db.query.wishlist.findFirst({
      where: eq(schema.wishlist.id, wishlistId),
      with: {
        owner: true,
        eventWishlists: true,
        items: { with: { taker: true } },
      },
    })

    return result ? PostgresWishlistRepository.toModel(result) : undefined
  }

  async findByIdOrFail(wishlistId: WishlistId): Promise<Wishlist> {
    const wishlist = await this.findById(wishlistId)
    if (!wishlist) throw new NotFoundException('Wishlist not found')
    return wishlist
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
      with: {
        owner: true,
        eventWishlists: true,
        items: { with: { taker: true } },
      },
    })

    return result.map(PostgresWishlistRepository.toModel)
  }

  async findByOwner(userId: UserId): Promise<Wishlist[]> {
    const result = await this.databaseService.db.query.wishlist.findMany({
      where: eq(schema.wishlist.ownerId, userId),
      with: {
        owner: true,
        eventWishlists: true,
        items: { with: { taker: true } },
      },
    })

    return result.map(PostgresWishlistRepository.toModel)
  }

  async save(wishlist: Wishlist, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client.transaction(async (subTx: DrizzleTransaction) => {
      await subTx
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

      // Remove all eventWishlists
      await subTx.delete(schema.eventWishlist).where(eq(schema.eventWishlist.wishlistId, wishlist.id))

      // Add new eventWishlists
      await subTx.insert(schema.eventWishlist).values(
        wishlist.eventIds.map(eventId => ({
          eventId,
          wishlistId: wishlist.id,
        })),
      )
    })
  }

  async delete(wishlistId: WishlistId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client.delete(schema.wishlist).where(eq(schema.wishlist.id, wishlistId))
  }

  async hasAccess(params: { wishlistId: WishlistId; userId: UserId }): Promise<boolean> {
    const result = await this.databaseService.db
      .select({ id: schema.wishlist.id })
      .from(schema.wishlist)
      .where(
        and(
          eq(schema.wishlist.id, params.wishlistId),
          // User is owner OR user is participant in any event that contains this wishlist
          or(
            eq(schema.wishlist.ownerId, params.userId),
            exists(
              this.databaseService.db
                .select()
                .from(schema.eventWishlist)
                .innerJoin(schema.eventAttendee, eq(schema.eventAttendee.eventId, schema.eventWishlist.eventId))
                .where(
                  and(
                    eq(schema.eventWishlist.wishlistId, params.wishlistId),
                    eq(schema.eventAttendee.userId, params.userId),
                  ),
                ),
            ),
          ),
        ),
      )
      .limit(1)

    return result.length > 0
  }

  static toModel(
    row: typeof schema.wishlist.$inferSelect & {
      owner: typeof schema.user.$inferSelect
      eventWishlists: (typeof schema.eventWishlist.$inferSelect)[]
      items: (typeof schema.item.$inferSelect & { taker: typeof schema.user.$inferSelect | null })[]
    },
  ): Wishlist {
    return new Wishlist({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      owner: PostgresUserRepository.toModel(row.owner),
      hideItems: row.hideItems,
      logoUrl: row.logoUrl ?? undefined,
      eventIds: row.eventWishlists.map(eventWishlist => eventWishlist.eventId),
      items: row.items.map(item => PostgresWishlistItemRepository.toModel(item)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
