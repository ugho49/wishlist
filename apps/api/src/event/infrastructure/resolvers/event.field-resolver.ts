import type { ICurrentUser } from '@wishlist/common';

import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlCurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { type GraphQLContext } from '../../../core/graphql/graphql.context';
import { type Event, type Wishlist } from '../../../gql/generated-types';

@Resolver('Event')
export class EventFieldResolver {
  @ResolveField()
  async wishlists(
    @Parent() event: Event,
    @GqlCurrentUser() currentUser: ICurrentUser,
    @Context() ctx: GraphQLContext,
  ): Promise<Wishlist[]> {
    if (event.wishlistIds.length === 0) return [];
    const wishlists = await ctx.loaders.getWishlistDataLoader(currentUser).loadMany(event.wishlistIds);
    return wishlists.filter((wishlist): wishlist is Wishlist => wishlist !== null);
  }
}
