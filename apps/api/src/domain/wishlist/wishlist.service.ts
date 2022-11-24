import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  createPagedResponse,
  CreateWishlistInputDto,
  DetailledWishlistDto,
  MiniWishlistDto,
  PagedResponse,
  WishlistWithEventsDto,
} from '@wishlist/common-types';
import { toDetailledWishlistDto, toMiniWishlistDto, toWishlistWithEventsDto } from './wishlist.mapper';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { WishlistRepository } from './wishlist.repository';
import { EventRepository } from '../event/event.repository';
import { WishlistEntity } from './wishlist.entity';
import { ItemEntity } from '../item/item.entity';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly eventRepository: EventRepository
  ) {}

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

  async create(param: { currentUserId: string; dto: CreateWishlistInputDto }): Promise<MiniWishlistDto> {
    const { currentUserId, dto } = param;
    const eventEntities = await this.eventRepository.findByIdsAndUserId({
      eventIds: dto.event_ids,
      userId: currentUserId,
    });

    if (eventEntities.length !== dto.event_ids.length) {
      throw new UnauthorizedException('You cannot add the wishlist to one or more events');
    }

    const wishlistEntity = WishlistEntity.create({
      title: dto.title,
      description: dto.description,
      ownerId: currentUserId,
      hideItems: dto.hide_items,
    });

    const itemEntities = dto.items.map((item) =>
      ItemEntity.create({
        name: item.name,
        description: item.description,
        url: item.url,
        score: item.score,
        isSuggested: false,
        wishlistId: wishlistEntity.id,
      })
    );

    wishlistEntity.events = Promise.resolve(eventEntities);
    wishlistEntity.items = Promise.resolve(itemEntities);

    await this.wishlistRepository.save(wishlistEntity);

    return toMiniWishlistDto(wishlistEntity);
  }
}
