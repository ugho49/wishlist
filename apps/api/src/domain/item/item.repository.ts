import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { ItemEntity } from './item.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class ItemRepository extends BaseRepository(ItemEntity) {
  async findByIdAndUserIdOrFail(param: { itemId: string; userId: string }): Promise<ItemEntity> {
    const entity = await this.createQueryBuilder('i')
      .innerJoin('i.wishlist', 'w')
      .innerJoin('w.events', 'e')
      .innerJoin('e.attendees', 'a')
      .where({ id: param.itemId })
      .andWhere('(e.creatorId = :userId OR a.userId = :userId)', { userId: param.userId })
      .getOne();

    if (!entity) {
      throw new NotFoundException('Item not found');
    }

    return entity;
  }

  updateById(id: string, partialEntity: QueryDeepPartialEntity<ItemEntity>) {
    return this.update({ id }, partialEntity);
  }
}
