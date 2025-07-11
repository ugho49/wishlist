import { Injectable, NotFoundException } from '@nestjs/common'
import { EventId, UserId, WishlistId } from '@wishlist/common'
import { EntityManager } from 'typeorm'

import { BaseRepository } from '../../common'
import { WishlistEntity } from './wishlist.entity'

@Injectable()
export class WishlistRepository extends BaseRepository(WishlistEntity) {
  findByIdAndUserId(params: { userId: UserId; wishlistId: WishlistId }): Promise<WishlistEntity | null> {
    return this.createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .leftJoinAndSelect('w.owner', 'o')
      .leftJoin('e.attendees', 'a')
      .where('w.id = :wishlistId', { wishlistId: params.wishlistId })
      .andWhere('a.user.id = :userId', { userId: params.userId })
      .getOne()
  }

  getAllWishlistForUserPaginated(params: {
    ownerId: UserId
    take: number
    skip: number
  }): Promise<[WishlistEntity[], number]> {
    const { ownerId, take, skip } = params

    const fetchQuery = this.createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .where('w.ownerId = :ownerId', { ownerId })
      .orderBy('e.eventDate', 'DESC')
      .addOrderBy('w.createdAt', 'DESC')
      .take(take)
      .skip(skip)
      .getMany()

    const countQuery = this.countBy({ ownerId })

    return Promise.all([fetchQuery, countQuery])
  }

  async findByIdOrThrow(wishlistId: WishlistId): Promise<WishlistEntity> {
    const entity = await this.findOneBy({ id: wishlistId })

    if (!entity) {
      throw new NotFoundException('Wishlist not found')
    }

    return entity
  }

  findEmailsToNotify(param: { ownerId: UserId; wishlistId: WishlistId }): Promise<string[]> {
    const { ownerId, wishlistId } = param

    return this.query(
      `
        SELECT u.email
        FROM wishlist w
               LEFT OUTER JOIN event_wishlist ew ON w.id = ew.wishlist_id
               LEFT OUTER JOIN event e on e.id = ew.event_id
               LEFT OUTER JOIN event_attendee ea on e.id = ea.event_id
               LEFT OUTER JOIN "user" u on ea.user_id = u.id
               LEFT OUTER JOIN user_email_setting ues on u.id = ues.user_id
        WHERE w.id = $1
          AND u.id != $2
          AND (ues IS NULL OR ues.daily_new_item_notification IS TRUE)
      `,
      [wishlistId, ownerId],
    ).then((list: Array<{ email: string }>) => list.reduce<string[]>((acc, val) => [...acc, val.email], []))
  }

  async linkEvent(params: { wishlistId: WishlistId; eventId: EventId; em?: EntityManager }): Promise<void> {
    const manager = params.em || this.manager
    await manager.query('INSERT INTO event_wishlist ("event_id","wishlist_id") VALUES ($1, $2)', [
      params.eventId,
      params.wishlistId,
    ])
  }

  async unlinkEvent(params: { wishlistId: WishlistId; eventId: EventId; em?: EntityManager }): Promise<void> {
    const manager = params.em || this.manager
    await manager.query('DELETE FROM event_wishlist WHERE event_id = $1 AND wishlist_id = $2', [
      params.eventId,
      params.wishlistId,
    ])
  }
}
