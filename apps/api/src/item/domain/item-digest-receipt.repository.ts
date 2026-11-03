import type { UserId } from '@wishlist/common';

export interface ItemDigestReceiptRepository {
  claim(params: { userId: UserId; digestDate: string }): Promise<boolean>;
  release(params: { userId: UserId; digestDate: string }): Promise<void>;
}
