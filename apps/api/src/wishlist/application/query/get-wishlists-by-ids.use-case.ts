import { Inject } from '@nestjs/common'
import { IInferredQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistId } from '@wishlist/common'

import { GetWishlistsByIdsQuery, Wishlist, WishlistRepository } from '../../domain'

@QueryHandler(GetWishlistsByIdsQuery)
export class GetWishlistsByIdsUseCase implements IInferredQueryHandler<GetWishlistsByIdsQuery> {
  constructor(@Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository) {}

  async execute(query: GetWishlistsByIdsQuery): Promise<Wishlist[]> {
    const wishlistIds = (
      await Promise.all(
        query.wishlistIds.map(wishlistId =>
          this.wishlistRepository.hasAccess({
            wishlistId,
            userId: query.currentUser.id,
          }),
        ),
      )
    )
      .filter(Boolean)
      .map((hasAccess, index) => (hasAccess ? query.wishlistIds[index] : undefined))
      .filter((wishlistId): wishlistId is WishlistId => wishlistId !== undefined)

    return this.wishlistRepository.findByIds(wishlistIds)
  }
}
