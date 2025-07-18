import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { EventRepository } from '@wishlist/api/event'
import { EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetWishlistsByOwnerQuery, GetWishlistsByOwnerResult, WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@QueryHandler(GetWishlistsByOwnerQuery)
export class GetMyWishlistsUseCase implements IInferredQueryHandler<GetWishlistsByOwnerQuery> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(query: GetWishlistsByOwnerQuery): Promise<GetWishlistsByOwnerResult> {
    const pageSize = query.pageSize || 10
    const skip = (query.pageNumber - 1) * pageSize

    const { wishlists, totalCount } = await this.wishlistRepository.findByOwnerPaginated({
      userId: query.ownerId,
      take: pageSize,
      skip: skip,
    })

    const events =
      totalCount > 0 ? await this.eventRepository.findByIds(wishlists.flatMap(wishlist => wishlist.eventIds)) : []

    return createPagedResponse({
      resources: wishlists.map(wishlist =>
        wishlistMapper.toWishlistWithEventsDto({
          wishlist,
          events: events.filter(event => wishlist.isLinkedToEvent(event.id)),
        }),
      ),
      options: { pageSize, totalElements: totalCount, pageNumber: query.pageNumber },
    })
  }
}
