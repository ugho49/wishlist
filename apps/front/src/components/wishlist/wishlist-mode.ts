/**
 * How the people who manage a list see it, derived from `config.hideItems`:
 * - `surprise`: the managers do not see who reserved what, nor the items suggested by others
 * - `shared`: everyone, managers included, sees who reserved what (a co-owner can be added)
 *
 * Every participant sees the list in both modes; only the managers' view changes.
 */
export type WishlistMode = 'surprise' | 'shared';

export const wishlistModeOf = (hideItems: boolean): WishlistMode => (hideItems ? 'surprise' : 'shared');

export const WISHLIST_MODE_LABELS: Record<WishlistMode, string> = {
  surprise: 'Mode surprise',
  shared: 'Mode partagé',
};
