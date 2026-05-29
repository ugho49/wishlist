import { Args, Query, Resolver } from '@nestjs/graphql'
import { IsAdmin } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER, ZodPipe } from '@wishlist/api/core'
import { createPagedResponse } from '@wishlist/common'

import { AdminGetWishlistsResult, AdminWishlistPaginationFilters } from '../../../gql/generated-types'
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case'
import { wishlistMapper } from '../wishlist.mapper'
import { AdminWishlistPaginationFiltersSchema } from '../wishlist.schema'

@IsAdmin()
@Resolver()
export class WishlistAdminResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}

  @Query()
  async adminWishlists(
    @Args('filters', new ZodPipe(AdminWishlistPaginationFiltersSchema)) filters: AdminWishlistPaginationFilters,
  ): Promise<AdminGetWishlistsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER
    const pageNumber = filters.page ?? 1

    const { wishlists, totalCount } = await this.getWishlistsByUserUseCase.execute({
      userId: filters.userId,
      pageNumber,
      pageSize,
    })

    const pagedResponse = createPagedResponse({
      resources: wishlists.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist, currentUserId: filters.userId })),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })

    return {
      __typename: 'AdminGetWishlists',
      data: pagedResponse.resources,
      pagination: {
        __typename: 'Pagination',
        totalPages: pagedResponse.pagination.total_pages,
        totalElements: pagedResponse.pagination.total_elements,
        pageNumber: pagedResponse.pagination.page_number,
        pageSize: pagedResponse.pagination.pages_size,
      },
    }
  }
}
