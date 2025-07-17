import { Injectable } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService } from '@wishlist/api/core'
import { WishlistItem, WishlistItemRepository } from '@wishlist/api/item'
import { WishlistId } from '@wishlist/common'
import { eq } from 'drizzle-orm'

import { PostgresUserRepository } from './user.repository'

@Injectable()
export class PostgresWishlistItemRepository implements WishlistItemRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByWishlist(wishlistId: WishlistId): Promise<WishlistItem[]> {
    const result = await this.databaseService.db.query.item.findMany({
      where: eq(schema.item.wishlistId, wishlistId),
      with: { taker: true },
    })

    return result.map(PostgresWishlistItemRepository.toModel)
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
