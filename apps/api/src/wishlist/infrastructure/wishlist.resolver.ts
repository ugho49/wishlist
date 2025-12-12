import { QueryBus } from '@nestjs/cqrs'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContext, PaginationInput } from '@wishlist/api/core'
import { UserId, WishlistId } from '@wishlist/common'

import { GqlEvent } from '../../event/infrastructure/event.dto'
import { GqlUser } from '../../user/infrastructure/user.dto'
import { GetWishlistsByUserQuery } from '../domain'
import { GqlWishlist, GqlWishlistPagedResponse } from './wishlist.dto'
import { wishlistMapper } from './wishlist.mapper'

@Resolver(() => GqlWishlist)
export class WishlistResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => GqlWishlist, { nullable: true })
  getWishlistById(@Args('id') id: WishlistId, @Context() ctx: GraphQLContext): Promise<GqlWishlist | null> {
    return ctx.loaders.wishlist.load(id)
  }

  @Query(() => GqlWishlistPagedResponse)
  async getMyWishlists(
    @Args('pagination') pagination: PaginationInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<GqlWishlistPagedResponse> {
    const result = await this.queryBus.execute(
      new GetWishlistsByUserQuery({
        userId: currentUserId,
        pageNumber: pagination.page,
        pageSize: pagination.limit,
      }),
    )

    return {
      resources: result.resources.map(wishlist => wishlistMapper.toGqlWishlist({ wishlist, currentUserId })),
      pagination: {
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }

  @ResolveField(() => GqlUser)
  async owner(@Parent() wishlist: GqlWishlist, @Context() ctx: GraphQLContext): Promise<GqlUser> {
    const owner = await ctx.loaders.user.load(wishlist.ownerId)
    if (!owner) {
      throw new Error('Owner not found')
    }
    return owner
  }

  @ResolveField(() => GqlUser, { nullable: true })
  async coOwner(@Parent() wishlist: GqlWishlist, @Context() ctx: GraphQLContext): Promise<GqlUser | undefined> {
    if (!wishlist.coOwnerId) return Promise.resolve(undefined)
    const coOwner = await ctx.loaders.user.load(wishlist.coOwnerId)
    if (!coOwner) {
      throw new Error('Co-owner not found')
    }
    return coOwner
  }

  @ResolveField(() => [GqlEvent])
  async events(@Parent() wishlist: GqlWishlist, @Context() ctx: GraphQLContext): Promise<GqlEvent[]> {
    if (wishlist.eventIds.length === 0) return []
    const events = await ctx.loaders.event.loadMany(wishlist.eventIds)
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is GqlEvent => event !== null)
  }
}
