import type { ICurrentUser } from '@wishlist/common';

import { NotFoundException } from '@nestjs/common';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import {
  type Event as GqlEvent,
  type Item as GqlItem,
  type User as GqlUser,
  type UserGiftProfile as GqlUserGiftProfile,
  type Wishlist as GqlWishlist,
} from '../../../gql/generated-types';
import { WishlistItem } from '../../../item/domain/wishlist-item.model';
import { itemMapper } from '../../../item/infrastructure/item.mapper';
import { userMapper } from '../../../user/infrastructure/user.mapper';
import { GetWishlistOwnerGiftProfileUseCase } from '../../application/query/get-wishlist-owner-gift-profile.use-case';

@Resolver('Wishlist')
export class WishlistFieldResolver {
  constructor(private readonly getWishlistOwnerGiftProfileUseCase: GetWishlistOwnerGiftProfileUseCase) {}
  @ResolveField()
  async owner(@Parent() wishlist: GqlWishlist, @Context() ctx: GraphQLContext): Promise<GqlUser> {
    const owner = await ctx.loaders.user.load(wishlist.ownerId);
    if (!owner) {
      throw new NotFoundException(`Owner with id ${wishlist.ownerId} of wishlist ${wishlist.id} not found`);
    }
    return owner;
  }

  @ResolveField()
  async coOwner(@Parent() wishlist: GqlWishlist, @Context() ctx: GraphQLContext): Promise<GqlUser | undefined> {
    if (!wishlist.coOwnerId) return Promise.resolve(undefined);
    const coOwner = await ctx.loaders.user.load(wishlist.coOwnerId);
    if (!coOwner) {
      throw new NotFoundException(`Co-owner with id ${wishlist.coOwnerId} of wishlist ${wishlist.id} not found`);
    }
    return coOwner;
  }

  @ResolveField()
  async events(
    @Parent() wishlist: GqlWishlist,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<GqlEvent[]> {
    if (wishlist.eventIds.length === 0) return [];
    const events = await ctx.loaders.getEventDataLoader(currentUser).loadMany(wishlist.eventIds);
    // Filter out null values (events user doesn't have access to)
    return events.filter((event): event is GqlEvent => event !== null);
  }

  @ResolveField()
  async items(
    @Parent() wishlist: GqlWishlist,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<GqlItem[]> {
    const items = await ctx.loaders.createItemsByWishlistLoader(currentUser).load(wishlist.id);
    const isOwner = currentUser.id === wishlist.ownerId;
    const isCoOwner = currentUser.id === wishlist.coOwnerId;
    const hideItems = wishlist.config.hideItems;

    const displayUserAndSuggested = WishlistItem.canDisplaySensitiveInformations({
      wishlist: { hideItems, isOwner, isCoOwner },
    });

    return items
      .filter(item => WishlistItem.canShowItem({ item, wishlist: { hideItems, isOwner, isCoOwner } }))
      .map(item => itemMapper.toGqlItem({ item, displayUserAndSuggested }));
  }

  @ResolveField()
  async ownerGiftProfile(
    @Parent() wishlist: GqlWishlist,
    @GqlCurrentUser() currentUser: ICurrentUser,
  ): Promise<GqlUserGiftProfile | undefined> {
    const profile = await this.getWishlistOwnerGiftProfileUseCase.execute({
      currentUser,
      wishlistId: wishlist.id,
    });
    return profile ? userMapper.toGqlUserGiftProfile(profile) : undefined;
  }
}
