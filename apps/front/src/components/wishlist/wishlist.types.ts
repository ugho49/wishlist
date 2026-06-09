import type * as Types from '../../gql/__generated__/types'

/**
 * The success member of the `WishlistPage` query union — the fully detailed
 * wishlist (with items, events, owner, coOwner, config) used across the
 * wishlist detail / edit pages.
 */
export type DetailedWishlist = Extract<Types.WishlistPageQuery['wishlist'], { __typename: 'Wishlist' }>

/** A single item as returned by the `WishlistPage` query. */
export type WishlistItem = DetailedWishlist['items'][number]

/** A single linked event as returned by the `WishlistPage` query. */
export type WishlistEvent = DetailedWishlist['events'][number]

/**
 * A wishlist card (with its linked events) as returned by the `WishlistListPage`
 * query — used by the "my lists" grid.
 */
export type WishlistListItem = Extract<
  Types.WishlistListPageQuery['wishlists'],
  { __typename: 'GetWishlistsPagedResponse' }
>['data'][number]

/** A row in the admin "wishlists for a user" table. */
export type AdminUserWishlistRow = Extract<
  Types.AdminListWishlistsForUserQuery['adminWishlists'],
  { __typename: 'AdminGetWishlists' }
>['data'][number]
