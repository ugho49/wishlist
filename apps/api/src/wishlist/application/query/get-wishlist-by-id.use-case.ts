import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DetailedWishlistDto, type ICurrentUser, type WishlistId } from '@wishlist/common';

import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { wishlistMapper } from '../../infrastructure/wishlist.mapper';

export type GetWishlistByIdInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
};

@Injectable()
export class GetWishlistByIdUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: GetWishlistByIdInput): Promise<DetailedWishlistDto> {
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: input.wishlistId,
      userId: input.currentUser.id,
    });

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist');
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(input.wishlistId);
    const events = await this.eventRepository.findByIds(wishlist.eventIds);

    return wishlistMapper.toDetailedWishlistDto({
      wishlist,
      events,
      currentUserId: input.currentUser.id,
    });
  }
}
