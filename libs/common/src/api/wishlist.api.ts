import type { EventId, WishlistId } from '../ids';

export type UploadWishlistLogoHttpResponse = {
  logo_url: string;
};

export type CreateWishlistHttpResponse = {
  id: WishlistId;
};

/** `data` field (JSON) of the `POST /wishlist` multipart form. */
export type CreateWishlistHttpRequest = {
  title: string;
  description?: string;
  /** Same values as the GraphQL `WishlistMode` enum. Defaults to `SURPRISE`. */
  mode?: 'SURPRISE' | 'SHARED';
  event_ids: EventId[];
};
