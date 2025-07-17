import { Injectable } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { EventId, UserId, WishlistId } from '@wishlist/common'

import { DatabaseService } from '../core/database'
import { WishlistRepository } from '../wishlist'
import { Wishlist } from '../wishlist/domain/wishlist.model'
import { PostgresUserRepository } from './user.repository'

@Injectable()
export class PostgresWishlistRepository implements WishlistRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  findById(wishlistId: WishlistId): Promise<Wishlist | undefined> {
    throw new Error('Method not implemented.')
  }

  findByEvent(eventId: EventId): Promise<Wishlist[]> {
    throw new Error('Method not implemented.')
  }

  findByOwner(userId: UserId): Promise<Wishlist[]> {
    throw new Error('Method not implemented.')
  }

  save(wishlist: Wishlist): Promise<void> {
    throw new Error('Method not implemented.')
  }

  delete(wishlistId: WishlistId): Promise<void> {
    throw new Error('Method not implemented.')
  }

  static toModel(row: typeof schema.wishlist.$inferSelect & { owner: typeof schema.user.$inferSelect }): Wishlist {
    return new Wishlist({
      id: row.id,
      title: row.title,
      description: row.description ?? undefined,
      owner: PostgresUserRepository.toModel(row.owner),
      hideItems: row.hideItems,
      logoUrl: row.logoUrl ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }
}
