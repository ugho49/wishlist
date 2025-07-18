import { Inject, UnauthorizedException } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'

import { GetWishlistByIdQuery, GetWishlistByIdResult, WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@QueryHandler(GetWishlistByIdQuery)
export class GetWishlistByIdUseCase implements IInferredQueryHandler<GetWishlistByIdQuery> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: GetWishlistByIdQuery): Promise<GetWishlistByIdResult> {
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: query.wishlistId,
      userId: query.currentUser.id,
    })

    if (!hasAccess) {
      throw new UnauthorizedException('You cannot access this wishlist')
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(query.wishlistId)
    const events = await this.eventRepository.findByIds(wishlist.eventIds)

    return wishlistMapper.toDetailedWishlistDto({
      wishlist,
      events,
      currentUserId: query.currentUser.id,
    })
  }
}
