import { NotFoundException } from '@nestjs/common';
import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { createPagedResponse, type ICurrentUser, type UserId, type WishlistId } from '@wishlist/common';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import { PaginationFiltersSchema } from '../../../core/graphql/common-type.schema';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { ZodPipe } from '../../../core/graphql/zod-pipe';
import {
  type GetMyWishlistsResult,
  type GetWishlistByIdResult,
  type PaginationFilters,
  type Wishlist,
} from '../../../gql/generated-types';
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case';
import { wishlistMapper } from '../wishlist.mapper';

@Resolver()
export class WishlistResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}

  @Query()
  async wishlist(
    @Args('id', { type: () => String }) id: WishlistId,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<GetWishlistByIdResult> {
    const wishlist = await ctx.loaders.getWishlistDataLoader(currentUser).load(id);
    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }
    return wishlist as Wishlist;
  }

  @Query()
  async wishlists(
    @Args('filters', new ZodPipe(PaginationFiltersSchema)) filters: PaginationFilters,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GetMyWishlistsResult> {
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER;
    const pageNumber = filters.page ?? 1;

    const { wishlists, totalCount } = await this.getWishlistsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
    });

    const pagedResponse = createPagedResponse({
      resources: wishlists.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist, currentUserId })),
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
