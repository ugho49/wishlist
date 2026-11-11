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
  hide_items?: boolean;
  event_ids: EventId[];
};
