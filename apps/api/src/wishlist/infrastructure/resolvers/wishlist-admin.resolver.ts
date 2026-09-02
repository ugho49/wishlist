import { Args, Query, Resolver } from '@nestjs/graphql';
import { createPagedResponse } from '@wishlist/common';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import { type AdminGetWishlistsResult, type AdminWishlistPaginationFilters } from '../../../gql/generated-types';
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case';
import { wishlistMapper } from '../wishlist.mapper';
import { AdminWishlistPaginationFiltersSchema } from '../wishlist.schema';

@IsAdmin()
@Resolver()
export class WishlistAdminResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}

  @Query()
  async adminWishlists(
    @Args('filters', new ZodPipe(AdminWishlistPaginationFiltersSchema)) filters: AdminWishlistPaginationFilters,
  ): Promise<AdminGetWishlistsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { wishlists, totalCount } = await this.getWishlistsByUserUseCase.execute({
      userId: filters.userId,
      pageNumber,
      pageSize,
    });

    const pagedResponse = createPagedResponse({
      resources: wishlists.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist })),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });

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
    };
  }
}
