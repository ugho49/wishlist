import { UserBuilder } from '../../../test-utils/builders/user.builder';
import { WishlistItemBuilder } from '../../../test-utils/builders/wishlist-item.builder';
import { User } from '../../user/domain/model/user.model';
import { beforeEach, describe, expect, it } from 'bun:test';

describe('WishlistItem purchase', () => {
  let taker: User;
  let stranger: User;

  beforeEach(() => {
    taker = new UserBuilder().withEmail('taker@test.fr').build();
    stranger = new UserBuilder().withEmail('stranger@test.fr').build();
  });

  it('should refuse a purchase from a user who did not reserve the item', () => {
    const item = new WishlistItemBuilder().takenBy(taker).build();

    expect(() => item.markAsPurchasedBy(stranger.id)).toThrow();
    expect(() => item.unmarkAsPurchasedBy(stranger.id)).toThrow();
  });

  it('should mark then unmark the purchase of the taker without touching updatedAt', () => {
    const item = new WishlistItemBuilder().takenBy(taker).build();

    const purchased = item.markAsPurchasedBy(taker.id);
    expect(purchased.purchasedAtBy(taker.id)).toBeInstanceOf(Date);
    expect(purchased.updatedAt).toBe(item.updatedAt);

    const unpurchased = purchased.unmarkAsPurchasedBy(taker.id);
    expect(unpurchased.purchasedAtBy(taker.id)).toBeUndefined();
  });

  it('should return the same item when the purchase does not change', () => {
    const item = new WishlistItemBuilder().takenBy(taker).build();

    expect(item.unmarkAsPurchasedBy(taker.id)).toBe(item);
    const purchased = item.markAsPurchasedBy(taker.id);
    expect(purchased.markAsPurchasedBy(taker.id)).toBe(purchased);
  });

  it('should drop the purchase with the reservation', () => {
    const item = new WishlistItemBuilder().takenBy(taker, { purchasedAt: new Date() }).build();

    expect(item.uncheck(taker.id).purchasedAtBy(taker.id)).toBeUndefined();
  });
});
