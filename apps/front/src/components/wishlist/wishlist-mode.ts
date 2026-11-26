import { WishlistMode } from '../../gql';

/**
 * Labels of the `WishlistMode` (what the managers of a list see):
 * - `Surprise`: the managers do not see who reserved what, nor the items suggested by others
 * - `Shared`: everyone, managers included, sees who reserved what (a co-owner can be added)
 *
 * Every participant sees the list in both modes; only the managers' view changes.
 */
export const WISHLIST_MODE_LABELS: Record<WishlistMode, string> = {
  [WishlistMode.Surprise]: 'Mode surprise',
  [WishlistMode.Shared]: 'Mode partagé',
};
