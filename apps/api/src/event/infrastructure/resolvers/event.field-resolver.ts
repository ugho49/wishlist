import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';

import { type Event, type SecretSanta, type Wishlist } from '../../../gql/generated-types';
import { SecretSantasByEventId } from '../../../secret-santa/infrastructure/secret-santa.dataloader';
import { WishlistsById } from '../../../wishlist/infrastructure/wishlist.dataloader';

@Resolver('Event')
export class EventFieldResolver {
  @ResolveField()
  async wishlists(@Parent() event: Event, @Loader() wishlistsLoader: Loader<WishlistsById>): Promise<Wishlist[]> {
    if (event.wishlistIds.length === 0) return [];
    const wishlists = await wishlistsLoader.loadMany(event.wishlistIds);
    return wishlists.filter((wishlist): wishlist is Wishlist => wishlist !== null);
  }

  @ResolveField()
  secretSanta(
    @Parent() event: Event,
    @Loader() secretSantasLoader: Loader<SecretSantasByEventId>,
  ): Promise<SecretSanta | null> {
    return secretSantasLoader.load(event.id);
  }
}
