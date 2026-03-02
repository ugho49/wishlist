import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { WishlistMessage, WishlistMessageRepository } from '@wishlist/api/wishlist-message'
import { schema } from '@wishlist/api-drizzle'
import { uuid, WishlistId, WishlistMessageId } from '@wishlist/common'
import { desc, eq } from 'drizzle-orm'

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

  async findByWishlistId(wishlistId: WishlistId): Promise<WishlistMessage[]> {
    const results = await this.databaseService.db.query.wishlistMessage.findMany({
      where: eq(schema.wishlistMessage.wishlistId, wishlistId),
      with: { author: true },
      orderBy: [desc(schema.wishlistMessage.createdAt)],
    })

    return results.map(PostgresWishlistMessageRepository.toModel)
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
