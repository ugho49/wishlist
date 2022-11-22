import { Injectable } from '@nestjs/common';
import {
  createPagedResponse,
  DetailledWishlistDto,
  PagedResponse,
  WishlistWithEventsDto,
} from '@wishlist/common-types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistEntity } from './wishlist.entity';
import { toDetailledWishlistDto, toWishlistWithEventsDto } from './wishlist.mapper';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistEntity)
    private readonly wishlistRepository: Repository<WishlistEntity>
  ) {}

  async findById(props: { currentUserId: string; wishlistId: string }): Promise<DetailledWishlistDto> {
    return this.wishlistRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .leftJoinAndSelect('w.owner', 'o')
      .leftJoin('e.attendees', 'a')
      .where('w.id = :wishlistId', { wishlistId: props.wishlistId })
      .andWhere('(e.creator.id = :userId OR a.user.id = :userId)', { userId: props.currentUserId })
      .getOneOrFail()
      .then((entity) => toDetailledWishlistDto(entity));
  }

  async getMyWishlistPaginated(param: {
    currentUserId: string;
    pageNumber?: number;
  }): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;

    const fetchQuery = this.wishlistRepository
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.events', 'e')
      .where('w.ownerId = :ownerId', { ownerId: currentUserId })
      .limit(pageSize)
      .offset(pageSize * (pageNumber || 0))
      .getMany();

    const countQuery = this.wishlistRepository.countBy({ ownerId: currentUserId });

    const [list, totalElements] = await Promise.all([fetchQuery, countQuery]);

    const dtos = await Promise.all(list.map((entity) => toWishlistWithEventsDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, currentIndex: pageNumber },
    });
  }
}
