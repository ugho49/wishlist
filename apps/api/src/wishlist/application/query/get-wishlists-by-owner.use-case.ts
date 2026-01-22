import { Inject, Injectable } from '@nestjs/common'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse, PagedResponse, UserId, WishlistWithEventsDto } from '@wishlist/common'

import { WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

export type GetWishlistsByOwnerInput = {
  ownerId: UserId
  pageNumber: number
  pageSize?: number
}

@Injectable()
export class GetWishlistsByOwnerUseCase {
  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: GetWishlistsByOwnerInput): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = input.pageSize ?? DEFAULT_RESULT_NUMBER
    const skip = (input.pageNumber - 1) * pageSize

    const { wishlists, totalCount } = await this.wishlistRepository.findByUserPaginated({
      userId: input.ownerId,
      pagination: { take: pageSize, skip },
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
      options: { pageSize, totalElements: totalCount, pageNumber: input.pageNumber },
    })
  }
}
