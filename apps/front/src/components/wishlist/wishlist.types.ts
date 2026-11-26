import type {
  AdminListWishlistsForUserQuery,
  AdminWishlistGetWishlistQuery,
  WishlistListPageQuery,
  WishlistPageQuery,
} from '../../gql/__generated__/graphql';

/**
 * The success member of the `WishlistPage` query union — the fully detailed
 * wishlist (with items, events, owner, coOwner, config) used across the
 * wishlist detail / edit pages.
 */
export type DetailedWishlist = Extract<WishlistPageQuery['wishlist'], { __typename: 'Wishlist' }>;

/** A single item as returned by the `WishlistPage` query. */
export type WishlistItem = DetailedWishlist['items'][number];

/** A single linked event as returned by the `WishlistPage` query. */
export type WishlistEvent = DetailedWishlist['events'][number];

/**
 * A wishlist card (with its linked events) as returned by the `WishlistListPage`
 * query — used by the "my lists" grid.
 */
export type WishlistListItem = Extract<
  WishlistListPageQuery['wishlists'],
  { __typename: 'GetWishlistsPagedResponse' }
>['data'][number];

/** A row in the admin "wishlists for a user" table. */
export type AdminUserWishlistRow = Extract<
  AdminListWishlistsForUserQuery['adminWishlists'],
  { __typename: 'AdminGetWishlists' }
>['data'][number];

/** The success member of the `AdminWishlistGetWishlist` query union — the admin wishlist detail page. */
export type AdminWishlistDetail = Extract<AdminWishlistGetWishlistQuery['adminWishlist'], { __typename: 'Wishlist' }>;

/** A row in the admin wishlist items table. */
export type AdminWishlistItem = AdminWishlistDetail['items'][number];

/** A row in the admin wishlist events table. */
export type AdminWishlistEvent = AdminWishlistDetail['events'][number];
