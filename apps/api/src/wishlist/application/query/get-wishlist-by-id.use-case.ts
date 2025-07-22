import { Inject, UnauthorizedException } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { GetWishlistByIdQuery, GetWishlistByIdResult, WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@QueryHandler(GetWishlistByIdQuery)
export class GetWishlistByIdUseCase implements IInferredQueryHandler<GetWishlistByIdQuery> {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
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
