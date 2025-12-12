import { QueryBus } from '@nestjs/cqrs'
import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlCurrentUser } from '@wishlist/api/auth'
import { GraphQLContextEnum, PaginationInput } from '@wishlist/api/core'
import { EventId, UserId, WishlistId } from '@wishlist/common'
import DataLoader from 'dataloader'

import { EventOutput } from '../../event/infrastructure/event.dto'
import { UserOutput } from '../../user/infrastructure/user.dto'
import { GetWishlistsByUserQuery } from '../domain'
import { WishlistOutput, WishlistOutputPagedResponse } from './wishlist.dto'
import { wishlistMapper } from './wishlist.mapper'

@Resolver(() => WishlistOutput)
export class WishlistResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Query(() => WishlistOutput, { nullable: true })
  getWishlistById(
    @Args('id') id: WishlistId,
    @Context(GraphQLContextEnum.WISHLIST_DATA_LOADER) dataLoader: DataLoader<WishlistId, WishlistOutput | null>,
  ): Promise<WishlistOutput | null> {
    return dataLoader.load(id)
  }

  @Query(() => WishlistOutputPagedResponse)
  async getMyWishlists(
    @Args('pagination') pagination: PaginationInput,
    @GqlCurrentUser('id') currentUserId: UserId,
  ): Promise<WishlistOutputPagedResponse> {
    const result = await this.queryBus.execute(
      new GetWishlistsByUserQuery({
        userId: currentUserId,
        pageNumber: pagination.page,
        pageSize: pagination.limit,
      }),
    )

    return {
      resources: result.resources.map(wishlist => wishlistMapper.toWishlistOutput({ wishlist, currentUserId })),
      pagination: {
        totalPages: result.pagination.total_pages,
        totalElements: result.pagination.total_elements,
        pageNumber: result.pagination.page_number,
        pageSize: result.pagination.pages_size,
      },
    }
  }

  @ResolveField(() => UserOutput)
  owner(
    @Parent() parent: WishlistOutput,
    @Context(GraphQLContextEnum.USER_DATA_LOADER) dataLoader: DataLoader<UserId, UserOutput>,
  ): Promise<UserOutput> {
    return dataLoader.load(parent.ownerId)
  }

  @ResolveField(() => UserOutput, { nullable: true })
  coOwner(
    @Parent() parent: WishlistOutput,
    @Context(GraphQLContextEnum.USER_DATA_LOADER) dataLoader: DataLoader<UserId, UserOutput>,
  ): Promise<UserOutput | undefined> {
    if (!parent.coOwnerId) return Promise.resolve(undefined)
    return dataLoader.load(parent.coOwnerId)
  }

  @ResolveField(() => [EventOutput])
  async events(
    @Parent() parent: WishlistOutput,
    @Context(GraphQLContextEnum.EVENT_DATA_LOADER) dataLoader: DataLoader<EventId, EventOutput | null>,
  ): Promise<EventOutput[]> {
    if (parent.eventIds.length === 0) return Promise.resolve([])
    const events = await Promise.all(parent.eventIds.map(eventId => dataLoader.load(eventId)))
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is EventOutput => event !== null)
  }
}
