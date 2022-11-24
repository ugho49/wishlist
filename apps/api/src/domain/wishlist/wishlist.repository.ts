import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '@wishlist/common-database';
import { WishlistEntity } from './wishlist.entity';

@Injectable()
export class WishlistRepository extends BaseRepository(WishlistEntity) {
  findByIdAndUserId(params: { userId: string; wishlistId: string }): Promise<WishlistEntity | null> {
    return this.createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .leftJoinAndSelect('w.owner', 'o')
      .leftJoin('e.attendees', 'a')
      .where('w.id = :wishlistId', { wishlistId: params.wishlistId })
      .andWhere('(e.creator.id = :userId OR a.user.id = :userId)', { userId: params.userId })
      .getOne();
  }

  getMyWishlistPaginated(params: {
    ownerId: string;
    pageSize: number;
    offset: number;
  }): Promise<[WishlistEntity[], number]> {
    const { ownerId, offset, pageSize } = params;

    const fetchQuery = this.createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .where('w.ownerId = :ownerId', { ownerId })
      .limit(pageSize)
      .offset(offset)
      .getMany();

    const countQuery = this.countBy({ ownerId });

    return Promise.all([fetchQuery, countQuery]);
  }

  async findByIdOrThrow(wishlistId: string): Promise<WishlistEntity> {
    const entity = await this.findOneBy({ id: wishlistId });

    if (!entity) {
      throw new NotFoundException('Wishlist not found');
    }

    return entity;
  }
}
