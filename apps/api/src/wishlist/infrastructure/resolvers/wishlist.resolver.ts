import { createPagedResponse, type UserId, type WishlistId } from '@wishlist/common';
import { Args, Loader, Query, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { Authenticated } from '../../../auth/infrastructure/decorators/public.metadata';
import { CurrentUserId } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { PaginationFiltersSchema } from '../../../core/graphql/common-type.schema';
import {
  type GetMyWishlistsResult,
  type GetWishlistByIdResult,
  type PaginationFilters,
  type Wishlist,
} from '../../../gql/generated-types';
import { WishlistsById } from '../../../wishlist/infrastructure/wishlist.dataloader';
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case';
import { wishlistMapper } from '../wishlist.mapper';

@Resolver()
@Authenticated()
export class WishlistResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}
  @Query()
  async wishlist(
    @Args('id') id: WishlistId,
    @Loader() wishlistsLoader: Loader<WishlistsById>,
  ): Promise<GetWishlistByIdResult> {
    const wishlist = await wishlistsLoader.load(id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist as Wishlist;
  }

  @Query()
  async wishlists(
    @Args('filters', PaginationFiltersSchema) filters: PaginationFilters,
    @CurrentUserId() currentUserId: UserId,
  ): Promise<GetMyWishlistsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { wishlists, totalCount } = await this.getWishlistsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
    });

    const pagedResponse = createPagedResponse({
      resources: wishlists.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist })),
      options: { pageSize, totalElements: totalCount, pageNumber },
    });

    return {
      __typename: 'GetWishlistsPagedResponse',
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
