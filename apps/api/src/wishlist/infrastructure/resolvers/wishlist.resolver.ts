import { NotFoundException } from '@nestjs/common'
import { Args, Context, Query, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext, PaginationFiltersSchema, ZodPipe } from '@wishlist/api/core'
import { UserId, WishlistId } from '@wishlist/common'

import { GetMyWishlistsResult, GetWishlistByIdResult, PaginationFilters, Wishlist } from '../../../gql/generated-types'
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case'
import { wishlistMapper } from '../wishlist.mapper'

@Resolver()
export class WishlistResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}

  @Query()
  async getWishlistById(
    @Args('id', { type: () => String }) id: WishlistId,
    @Context() ctx: GraphQLContext,
  ): Promise<GetWishlistByIdResult> {
    const wishlist = await ctx.loaders.wishlist.load(id)
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found')
    }
    return wishlist as Wishlist
  }

  @Query()
  async getMyWishlists(
    @Args('filters', new ZodPipe(PaginationFiltersSchema)) filters: PaginationFilters,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GetMyWishlistsResult> {
    const result = await this.getWishlistsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber: filters.page ?? 1,
      pageSize: filters.limit ?? 10,
    })

    return {
      __typename: 'GetWishlistsPagedResponse',
      data: result.resources.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist, currentUserId })) as Wishlist[],
      pagination: {
        __typename: 'Pagination',
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }
}
