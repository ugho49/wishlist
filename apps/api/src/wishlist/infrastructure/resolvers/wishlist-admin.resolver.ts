import type { ICurrentUser } from '@wishlist/common';

import { createPagedResponse, type WishlistId } from '@wishlist/common';
import { Args, Loader, Mutation, Query, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { DEFAULT_RESULT_NUMBER } from '../../../core/common/pagination';
import {
  type AdminDeleteWishlistResult,
  type AdminGetWishlistByIdResult,
  type AdminGetWishlistsResult,
  type AdminRemoveWishlistCoOwnerResult,
  type AdminRemoveWishlistLogoResult,
  type AdminUpdateWishlistResult,
  type AdminWishlistPaginationFilters,
  type UpdateWishlistInput,
} from '../../../gql/generated-types';
import { DeleteWishlistUseCase } from '../../application/command/delete-wishlist.use-case';
import { RemoveCoOwnerUseCase } from '../../application/command/remove-co-owner.use-case';
import { RemoveWishlistLogoUseCase } from '../../application/command/remove-wishlist-logo.use-case';
import { UpdateWishlistUseCase } from '../../application/command/update-wishlist.use-case';
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case';
import { WishlistsById } from '../wishlist.dataloader';
import { wishlistMapper } from '../wishlist.mapper';
import { AdminWishlistPaginationFiltersSchema, UpdateWishlistInputSchema, WishlistIdSchema } from '../wishlist.schema';

@IsAdmin()
@Resolver()
export class WishlistAdminResolver {
  constructor(
    private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase,
    private readonly updateWishlistUseCase: UpdateWishlistUseCase,
    private readonly deleteWishlistUseCase: DeleteWishlistUseCase,
    private readonly removeWishlistLogoUseCase: RemoveWishlistLogoUseCase,
    private readonly removeCoOwnerUseCase: RemoveCoOwnerUseCase,
  ) {}

  @Query()
  async adminWishlist(
    @Args('id', WishlistIdSchema) id: WishlistId,
    @Loader() wishlistsLoader: Loader<WishlistsById>,
  ): Promise<AdminGetWishlistByIdResult> {
    // The dataloader resolves any wishlist for an admin.
    const wishlist = await wishlistsLoader.load(id);
    if (!wishlist) {
      throw new NotFoundException(`Wishlist with id ${id} not found`);
    }
    return wishlist;
  }

  @Query()
  async adminWishlists(
    @Args('filters', AdminWishlistPaginationFiltersSchema) filters: AdminWishlistPaginationFilters,
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

  @Mutation()
  async adminUpdateWishlist(
    @Args('id', WishlistIdSchema) wishlistId: WishlistId,
    @Args('input', UpdateWishlistInputSchema) input: UpdateWishlistInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminUpdateWishlistResult> {
    await this.updateWishlistUseCase.execute({
      wishlistId,
      currentUser,
      updateWishlist: { title: input.title, description: input.description ?? undefined },
    });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminDeleteWishlist(
    @Args('id', WishlistIdSchema) wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminDeleteWishlistResult> {
    await this.deleteWishlistUseCase.execute({ wishlistId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRemoveWishlistLogo(
    @Args('id', WishlistIdSchema) wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRemoveWishlistLogoResult> {
    await this.removeWishlistLogoUseCase.execute({ wishlistId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }

  @Mutation()
  async adminRemoveWishlistCoOwner(
    @Args('id', WishlistIdSchema) wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<AdminRemoveWishlistCoOwnerResult> {
    await this.removeCoOwnerUseCase.execute({ wishlistId, currentUser });
    return { __typename: 'VoidOutput', success: true };
  }
}
