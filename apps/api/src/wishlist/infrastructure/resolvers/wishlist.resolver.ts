import { QueryBus } from '@nestjs/cqrs'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { UserId } from '@wishlist/common'

import { CurrentGqlUser } from '../../../auth'
import { DEFAULT_RESULT_NUMBER } from '../../../core'
import { GetWishlistsByOwnerQuery } from '../../domain'
import { GetMyWishlistsInput } from './wishlist.gql-input'
import { PaginatedWishlistType } from './wishlist.gql-type'

@Resolver()
export class WishlistResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => PaginatedWishlistType, { description: 'Get current user wishlists with pagination' })
  async getMyWishlists(
    @CurrentGqlUser('id') currentUserId: UserId,
    @Args('input', { type: () => GetMyWishlistsInput, defaultValue: { page: 1 } }) input: GetMyWishlistsInput,
  ): Promise<PaginatedWishlistType> {
    const result = await this.queryBus.execute(
      new GetWishlistsByOwnerQuery({
        ownerId: currentUserId,
        pageNumber: input.page,
        pageSize: DEFAULT_RESULT_NUMBER,
      }),
    )

    return {
      data: result.resources,
      pagination: {
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }
}
