import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { createPagedResponse } from '@wishlist/common'

import { GetWishlistsByUserQuery, GetWishlistsByUserResult, WishlistRepository } from '../../domain'

@QueryHandler(GetWishlistsByUserQuery)
export class GetWishlistsByUserUseCase implements IInferredQueryHandler<GetWishlistsByUserQuery> {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(query: GetWishlistsByUserQuery): Promise<GetWishlistsByUserResult> {
    const pageSize = query.pageSize ?? DEFAULT_RESULT_NUMBER
    const skip = (query.pageNumber - 1) * pageSize

    const { wishlists, totalCount } = await this.wishlistRepository.findByUserPaginated({
      userId: query.userId,
      pagination: { take: pageSize, skip },
    })

    return createPagedResponse({
      resources: wishlists,
      options: { pageSize, totalElements: totalCount, pageNumber: query.pageNumber },
    })
  }
}
