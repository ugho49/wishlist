import { Injectable, NotFoundException } from '@nestjs/common'
import { camelCaseKeys } from '@wishlist/common'
import { BaseRepository } from '@wishlist/common-database'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import { ItemEntity } from './item.entity'
import { NewItemsForWishlist } from './item.interface'

@Injectable()
export class ItemRepository extends BaseRepository(ItemEntity) {
  async findByIdAndUserIdOrFail(param: { itemId: string; userId: string }): Promise<ItemEntity> {
    const entity = await this.createQueryBuilder('i')
      .innerJoin('i.wishlist', 'w')
      .innerJoin('w.events', 'e')
      .innerJoin('e.attendees', 'a')
      .where({ id: param.itemId })
      .andWhere('a.userId = :userId', { userId: param.userId })
      .getOne()

    if (!entity) {
      throw new NotFoundException('Item not found')
    }

    return entity
  }

  updateById(id: string, partialEntity: QueryDeepPartialEntity<ItemEntity>) {
    return this.update({ id }, partialEntity)
  }

  findAllNewItems(): Promise<NewItemsForWishlist[]> {
    return this.query(
      `
      SELECT i.wishlist_id                          AS wishlist_id,
             w.title                                AS wishlist_title,
             w.owner_id                             AS owner_id,
             CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
             COUNT(i)                               AS nb_new_items
      FROM item i
             INNER JOIN wishlist w ON w.id = i.wishlist_id
             INNER JOIN "user" u on w.owner_id = u.id
      WHERE i.is_suggested = FALSE
        AND i.created_at > NOW() - INTERVAL '1 DAY'
      GROUP BY wishlist_id, wishlist_title, owner_id, owner_name
    `,
    ).then(list => list.map((element: Record<string, unknown>) => camelCaseKeys(element)))
  }
}
