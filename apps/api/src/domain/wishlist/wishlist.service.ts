import { Injectable, NotFoundException } from '@nestjs/common';
import {
  createPagedResponse,
  DetailledWishlistDto,
  PagedResponse,
  WishlistWithEventsDto,
} from '@wishlist/common-types';
import { toDetailledWishlistDto, toWishlistWithEventsDto } from './wishlist.mapper';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { WishlistRepository } from './wishlist.repository';

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async findById(props: { currentUserId: string; wishlistId: string }): Promise<DetailledWishlistDto> {
    const entity = await this.wishlistRepository.findByIdAndUserId({
      userId: props.currentUserId,
      wishlistId: props.wishlistId,
    });

    if (!entity) {
      throw new NotFoundException('Wishlist not found');
    }

    return toDetailledWishlistDto(entity);
  }

  async getMyWishlistPaginated(param: {
    currentUserId: string;
    pageNumber?: number;
  }): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;
    const offset = pageSize * (pageNumber || 0);

    const [entities, totalElements] = await this.wishlistRepository.getMyWishlistPaginated({
      ownerId: currentUserId,
      pageSize,
      offset,
    });

    const dtos = await Promise.all(entities.map((entity) => toWishlistWithEventsDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    });
  }
}
