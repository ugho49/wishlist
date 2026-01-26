import { NotFoundException } from '@nestjs/common'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { DEFAULT_RESULT_NUMBER, GraphQLContext, PaginationFiltersSchema, ZodPipe } from '@wishlist/api/core'
import { createPagedResponse, UserId, WishlistId } from '@wishlist/common'

import {
  Event,
  GetMyWishlistsResult,
  GetWishlistByIdResult,
  PaginationFilters,
  User,
  Wishlist,
} from '../../../gql/generated-types'
import { GetWishlistsByUserUseCase } from '../../application/query/get-wishlists-by-user.use-case'
import { wishlistMapper } from '../wishlist.mapper'

@Resolver('Wishlist')
export class WishlistResolver {
  constructor(private readonly getWishlistsByUserUseCase: GetWishlistsByUserUseCase) {}

  @ResolveField()
  async owner(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<User> {
    const owner = await ctx.loaders.user.load(wishlist.ownerId)
    if (!owner) {
      throw new NotFoundException(`Owner with id ${wishlist.ownerId} of wishlist ${wishlist.id} not found`)
    }
    return owner
  }

  @ResolveField()
  async coOwner(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<User | undefined> {
    if (!wishlist.coOwnerId) return Promise.resolve(undefined)
    const coOwner = await ctx.loaders.user.load(wishlist.coOwnerId)
    if (!coOwner) {
      throw new NotFoundException(`Co-owner with id ${wishlist.coOwnerId} of wishlist ${wishlist.id} not found`)
    }
    return coOwner
  }

  @ResolveField()
  async events(@Parent() wishlist: Wishlist, @Context() ctx: GraphQLContext): Promise<Event[]> {
    if (wishlist.eventIds.length === 0) return []
    const events = await ctx.loaders.event.loadMany(wishlist.eventIds)
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is Event => event !== null)
  }

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
    const pageSize = filters.limit ?? DEFAULT_RESULT_NUMBER
    const pageNumber = filters.page ?? 1

    const { wishlists, totalCount } = await this.getWishlistsByUserUseCase.execute({
      userId: currentUserId,
      pageNumber,
      pageSize,
    })

    const pagedResponse = createPagedResponse({
      resources: wishlists.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist, currentUserId })),
      options: { pageSize, totalElements: totalCount, pageNumber },
    })

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
    }
  }
}
