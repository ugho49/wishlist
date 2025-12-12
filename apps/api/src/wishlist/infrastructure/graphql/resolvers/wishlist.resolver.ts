import { UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { EventId, ICurrentUser, UserId, WishlistId } from '@wishlist/common'

import { GqlAuthGuard, GqlCurrentUser } from '../../../../graphql'
import {
  AddCoOwnerCommand,
  CreateWishlistCommand,
  DeleteWishlistCommand,
  GetWishlistByIdQuery,
  GetWishlistsByOwnerQuery,
  LinkWishlistToEventCommand,
  RemoveCoOwnerCommand,
  RemoveWishlistLogoCommand,
  UnlinkWishlistFromEventCommand,
  UpdateWishlistCommand,
} from '../../../domain'
import { wishlistGraphQLMapper } from '../mappers'
import {
  AddCoOwnerInput,
  CreateWishlistInput,
  DetailedWishlistObject,
  GetWishlistsInput,
  LinkUnlinkWishlistInput,
  UpdateWishlistInput,
  WishlistsPageObject,
} from '../types'

@Resolver()
@UseGuards(GqlAuthGuard)
export class WishlistResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Query(() => WishlistsPageObject, { name: 'myWishlists', description: 'Get paginated list of my wishlists' })
  async myWishlists(
    @GqlCurrentUser('id') currentUserId: UserId,
    @Args('input', { nullable: true }) input?: GetWishlistsInput,
  ): Promise<WishlistsPageObject> {
    const result = await this.queryBus.execute(
      new GetWishlistsByOwnerQuery({
        ownerId: currentUserId,
        pageNumber: input?.page ?? 1,
        pageSize: input?.limit ?? DEFAULT_RESULT_NUMBER,
      }),
    )
    return wishlistGraphQLMapper.toWishlistsPageObject(result)
  }

  @Query(() => DetailedWishlistObject, { name: 'wishlist', description: 'Get wishlist by ID with details' })
  async wishlist(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) wishlistId: WishlistId,
  ): Promise<DetailedWishlistObject> {
    const result = await this.queryBus.execute(new GetWishlistByIdQuery({ wishlistId, currentUser }))
    return wishlistGraphQLMapper.toDetailedWishlistObject(result)
  }

  @Mutation(() => DetailedWishlistObject, { name: 'createWishlist', description: 'Create a new wishlist' })
  async createWishlist(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('input') input: CreateWishlistInput,
  ): Promise<DetailedWishlistObject> {
    const result = await this.commandBus.execute(
      new CreateWishlistCommand({
        currentUser,
        newWishlist: {
          title: input.title,
          description: input.description,
          eventIds: input.eventIds as EventId[],
          hideItems: input.hideItems,
        },
      }),
    )
    return wishlistGraphQLMapper.toDetailedWishlistObject(result)
  }

  @Mutation(() => Boolean, { name: 'updateWishlist', description: 'Update an existing wishlist' })
  async updateWishlist(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) wishlistId: WishlistId,
    @Args('input') input: UpdateWishlistInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UpdateWishlistCommand({
        wishlistId,
        currentUser,
        updateWishlist: {
          title: input.title,
          description: input.description,
        },
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'deleteWishlist', description: 'Delete a wishlist' })
  async deleteWishlist(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('id', { type: () => ID }) wishlistId: WishlistId,
  ): Promise<boolean> {
    await this.commandBus.execute(new DeleteWishlistCommand({ wishlistId, currentUser }))
    return true
  }

  @Mutation(() => Boolean, { name: 'linkWishlistToEvent', description: 'Link a wishlist to an event' })
  async linkWishlistToEvent(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
    @Args('input') input: LinkUnlinkWishlistInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new LinkWishlistToEventCommand({
        wishlistId,
        currentUser,
        eventId: input.eventId as EventId,
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'unlinkWishlistFromEvent', description: 'Unlink a wishlist from an event' })
  async unlinkWishlistFromEvent(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
    @Args('input') input: LinkUnlinkWishlistInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new UnlinkWishlistFromEventCommand({
        wishlistId,
        currentUser,
        eventId: input.eventId as EventId,
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'removeWishlistLogo', description: 'Remove wishlist logo' })
  async removeWishlistLogo(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
  ): Promise<boolean> {
    await this.commandBus.execute(new RemoveWishlistLogoCommand({ wishlistId, currentUser }))
    return true
  }

  @Mutation(() => Boolean, { name: 'addWishlistCoOwner', description: 'Add a co-owner to a wishlist' })
  async addWishlistCoOwner(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
    @Args('input') input: AddCoOwnerInput,
  ): Promise<boolean> {
    await this.commandBus.execute(
      new AddCoOwnerCommand({
        wishlistId,
        currentUser,
        coOwnerId: input.userId as UserId,
      }),
    )
    return true
  }

  @Mutation(() => Boolean, { name: 'removeWishlistCoOwner', description: 'Remove the co-owner from a wishlist' })
  async removeWishlistCoOwner(
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Args('wishlistId', { type: () => ID }) wishlistId: WishlistId,
  ): Promise<boolean> {
    await this.commandBus.execute(new RemoveCoOwnerCommand({ wishlistId, currentUser }))
    return true
  }
}
