import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { WishlistMessage, WishlistMessageRepository } from '@wishlist/api/wishlist-message'
import { schema } from '@wishlist/api-drizzle'
import { UserId, uuid, WishlistId, WishlistMessageId } from '@wishlist/common'
import { and, count, desc, eq, gt, lt, or, sql } from 'drizzle-orm'

import { PostgresUserRepository } from './postgres-user.repository'

@Injectable()
export class PostgresWishlistMessageRepository implements WishlistMessageRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): WishlistMessageId {
    return uuid() as WishlistMessageId
  }

  async findById(id: WishlistMessageId): Promise<WishlistMessage | undefined> {
    const result = await this.databaseService.db.query.wishlistMessage.findFirst({
      where: eq(schema.wishlistMessage.id, id),
      with: { author: true },
    })

    return result ? PostgresWishlistMessageRepository.toModel(result) : undefined
  }

  async findByIdOrFail(id: WishlistMessageId): Promise<WishlistMessage> {
    const message = await this.findById(id)
    if (!message) throw new NotFoundException('Wishlist message not found')
    return message
  }

  async findByWishlistIdPaginated(params: {
    wishlistId: WishlistId
    cursor?: { createdAt: Date; id: WishlistMessageId }
    limit: number
  }): Promise<WishlistMessage[]> {
    const { wishlistId, cursor, limit } = params

    const conditions = [eq(schema.wishlistMessage.wishlistId, wishlistId)]

    if (cursor) {
      conditions.push(
        or(
          lt(schema.wishlistMessage.createdAt, cursor.createdAt),
          and(eq(schema.wishlistMessage.createdAt, cursor.createdAt), lt(schema.wishlistMessage.id, cursor.id)),
        )!,
      )
    }

    const results = await this.databaseService.db.query.wishlistMessage.findMany({
      where: and(...conditions),
      with: { author: true },
      orderBy: [desc(schema.wishlistMessage.createdAt), desc(schema.wishlistMessage.id)],
      limit,
    })

    return results.map(PostgresWishlistMessageRepository.toModel)
  }

  async countUnreadMessages(params: { wishlistId: WishlistId; lastReadAt?: Date }): Promise<number> {
    const conditions = [eq(schema.wishlistMessage.wishlistId, params.wishlistId)]

    if (params.lastReadAt) {
      conditions.push(gt(schema.wishlistMessage.createdAt, params.lastReadAt))
    }

    const result = await this.databaseService.db
      .select({ count: count() })
      .from(schema.wishlistMessage)
      .where(and(...conditions))

    return result[0]?.count ?? 0
  }

  async getLastReadAt(params: { userId: UserId; wishlistId: WishlistId }): Promise<Date | undefined> {
    const result = await this.databaseService.db.query.wishlistMessageRead.findFirst({
      where: and(
        eq(schema.wishlistMessageRead.userId, params.userId),
        eq(schema.wishlistMessageRead.wishlistId, params.wishlistId),
      ),
    })

    return result?.lastReadAt
  }

  async markAsRead(params: { userId: UserId; wishlistId: WishlistId }): Promise<void> {
    await this.databaseService.db
      .insert(schema.wishlistMessageRead)
      .values({
        userId: params.userId,
        wishlistId: params.wishlistId,
        lastReadAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schema.wishlistMessageRead.userId, schema.wishlistMessageRead.wishlistId],
        set: { lastReadAt: sql`now()` },
      })
  }

  async save(message: WishlistMessage, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db

    await client
      .insert(schema.wishlistMessage)
      .values({
        id: message.id,
        wishlistId: message.wishlistId,
        authorId: message.author.id,
        content: message.content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })
      .onConflictDoUpdate({
        target: schema.wishlistMessage.id,
        set: {
          content: message.content,
          updatedAt: message.updatedAt,
        },
      })
  }

  async delete(id: WishlistMessageId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx || this.databaseService.db
    await client.delete(schema.wishlistMessage).where(eq(schema.wishlistMessage.id, id))
  }

  static toModel(
    row: typeof schema.wishlistMessage.$inferSelect & {
      author: typeof schema.user.$inferSelect
    },
  ): WishlistMessage {
    return new WishlistMessage({
      id: row.id,
      wishlistId: row.wishlistId,
      author: PostgresUserRepository.toModel(row.author),
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
