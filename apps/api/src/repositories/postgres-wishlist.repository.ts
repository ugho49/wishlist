import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { Wishlist, WishlistRepository } from '@wishlist/api/wishlist'
import { schema } from '@wishlist/api-drizzle'
import { EventId, UserId, uuid, WishlistId } from '@wishlist/common'
import { and, count, desc, eq, exists, inArray, or, sql } from 'drizzle-orm'

import { PostgresUserRepository } from './postgres-user.repository'
import { PostgresWishlistItemRepository } from './postgres-wishlist-item.repository'

@Injectable()
export class PostgresWishlistRepository implements WishlistRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): WishlistId {
    return uuid() as WishlistId
  }

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

  async findByIds(wishlistIds: WishlistId[]): Promise<Wishlist[]> {
    const result = await this.databaseService.db.query.wishlist.findMany({
      where: inArray(schema.wishlist.id, wishlistIds),
      with: {
        owner: true,
        eventWishlists: true,
        items: { with: { taker: true } },
      },
    })

    return result.map(PostgresWishlistRepository.toModel)
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

  async findByOwnerPaginated(params: {
    userId: UserId
    pagination: { take: number; skip: number }
  }): Promise<{ wishlists: Wishlist[]; totalCount: number }> {
    // Get total count
    const totalCountResult = await this.databaseService.db
      .select({ count: count() })
      .from(schema.wishlist)
      .where(eq(schema.wishlist.ownerId, params.userId))

    const totalCount = totalCountResult[0]?.count ?? 0

    if (totalCount === 0) return { wishlists: [], totalCount }

    // Première requête : récupérer les IDs des wishlists dans le bon ordre
    const orderedWishlistIds = await this.databaseService.db
      .select({ id: schema.wishlist.id })
      .from(schema.wishlist)
      .leftJoin(schema.eventWishlist, eq(schema.wishlist.id, schema.eventWishlist.wishlistId))
      .leftJoin(schema.event, eq(schema.eventWishlist.eventId, schema.event.id))
      .where(eq(schema.wishlist.ownerId, params.userId))
      .groupBy(schema.wishlist.id)
      .orderBy(desc(sql<string>`MAX(${schema.event.eventDate})`), desc(schema.wishlist.createdAt))
      .limit(params.pagination.take)
      .offset(params.pagination.skip)

    // Deuxième requête : récupérer toutes les données nécessaires pour toModel
    const validWishlists = await this.databaseService.db.query.wishlist.findMany({
      where: inArray(
        schema.wishlist.id,
        orderedWishlistIds.map(row => row.id),
      ),
      with: {
        owner: true,
        eventWishlists: true,
        items: { with: { taker: true } },
      },
    })

    // Réordonner selon l'ordre de la première requête
    const wishlistsMap = new Map(validWishlists.map(w => [w.id, w]))
    const wishlists = orderedWishlistIds
      .map(row => wishlistsMap.get(row.id))
      .filter((wishlist): wishlist is NonNullable<typeof wishlist> => wishlist !== undefined)
      .map(PostgresWishlistRepository.toModel)

    return { wishlists, totalCount }
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
            description: wishlist.description ?? null,
            ownerId: wishlist.owner.id,
            hideItems: wishlist.hideItems,
            logoUrl: wishlist.logoUrl ?? null,
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

  async findEmailsToNotify(params: { ownerId: UserId; wishlistId: WishlistId }): Promise<string[]> {
    const result = await this.databaseService.db
      .select({ email: schema.user.email })
      .from(schema.wishlist)
      .leftJoin(schema.eventWishlist, eq(schema.wishlist.id, schema.eventWishlist.wishlistId))
      .leftJoin(schema.event, eq(schema.eventWishlist.eventId, schema.event.id))
      .leftJoin(schema.eventAttendee, eq(schema.event.id, schema.eventAttendee.eventId))
      .leftJoin(schema.user, eq(schema.eventAttendee.userId, schema.user.id))
      .leftJoin(schema.userEmailSetting, eq(schema.user.id, schema.userEmailSetting.userId))
      .where(
        and(
          eq(schema.wishlist.id, params.wishlistId),
          // Exclude the wishlist owner
          sql`${schema.user.id} != ${params.ownerId}`,
          // Include users who either have no email settings (default to notify) or have notifications enabled
          or(sql`${schema.userEmailSetting.id} IS NULL`, eq(schema.userEmailSetting.dailyNewItemNotification, true)),
        ),
      )

    return result.map(row => row.email).filter((email): email is string => email !== null)
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
