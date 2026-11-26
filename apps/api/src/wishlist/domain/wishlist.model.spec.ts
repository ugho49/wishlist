import { toCurrentUser, UserBuilder } from '../../../test-utils/builders/user.builder';
import { WishlistBuilder } from '../../../test-utils/builders/wishlist.builder';
import { WishlistItemBuilder } from '../../../test-utils/builders/wishlist-item.builder';
import { WishlistItem } from '../../item/domain/wishlist-item.model';
import { WishlistMode } from './wishlist-mode.enum';
import { describe, expect, it } from 'bun:test';

describe('Wishlist mode', () => {
  const owner = new UserBuilder().withEmail('owner@test.fr').build();
  const coOwner = new UserBuilder().withEmail('co-owner@test.fr').build();
  const participant = new UserBuilder().withEmail('participant@test.fr').build();

  describe('in surprise mode', () => {
    const wishlist = new WishlistBuilder().withOwner(owner).withMode(WishlistMode.SURPRISE).build();

    it('should be a surprise for the owner only', () => {
      expect(wishlist.isSurpriseFor(owner.id)).toBe(true);
      expect(wishlist.isSurpriseFor(participant.id)).toBe(false);
    });

    it('should not allow a co-owner', () => {
      expect(wishlist.canHaveCoOwner()).toBe(false);
    });
  });

  describe('in shared mode', () => {
    const wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).withMode(WishlistMode.SHARED).build();

    it('should not be a surprise for anyone', () => {
      expect(wishlist.isSurpriseFor(owner.id)).toBe(false);
      expect(wishlist.isSurpriseFor(coOwner.id)).toBe(false);
      expect(wishlist.isSurpriseFor(participant.id)).toBe(false);
    });

    it('should allow a co-owner', () => {
      expect(wishlist.canHaveCoOwner()).toBe(true);
    });
  });

  describe('permissions', () => {
    const admin = new UserBuilder().withEmail('admin@test.fr').asAdmin().build();
    const wishlist = new WishlistBuilder().withOwner(owner).withCoOwner(coOwner).withMode(WishlistMode.SHARED).build();

    it('should let the managers and the admins modify the list', () => {
      expect(wishlist.canBeModifiedBy(toCurrentUser(owner))).toBe(true);
      expect(wishlist.canBeModifiedBy(toCurrentUser(coOwner))).toBe(true);
      expect(wishlist.canBeModifiedBy(toCurrentUser(admin))).toBe(true);
      expect(wishlist.canBeModifiedBy(toCurrentUser(participant))).toBe(false);
    });

    it('should let only the owner and the admins remove the co-owner', () => {
      expect(wishlist.canRemoveCoOwner(toCurrentUser(owner))).toBe(true);
      expect(wishlist.canRemoveCoOwner(toCurrentUser(admin))).toBe(true);
      expect(wishlist.canRemoveCoOwner(toCurrentUser(coOwner))).toBe(false);
      expect(wishlist.canRemoveCoOwner(toCurrentUser(participant))).toBe(false);
    });
  });

  describe('items visibility', () => {
    const wishlist = new WishlistBuilder().withOwner(owner).build();
    const suggestedItem = new WishlistItemBuilder().withWishlistId(wishlist.id).asSuggested().build();
    const ownItem = new WishlistItemBuilder().withWishlistId(wishlist.id).build();

    it('should hide the suggested items and the reservations when the list is a surprise for the user', () => {
      expect(WishlistItem.canShowItem({ item: suggestedItem, isSurpriseForUser: true })).toBe(false);
      expect(WishlistItem.canShowItem({ item: ownItem, isSurpriseForUser: true })).toBe(true);
      expect(WishlistItem.canDisplaySensitiveInformations({ isSurpriseForUser: true })).toBe(false);
    });

    it('should show everything otherwise', () => {
      expect(WishlistItem.canShowItem({ item: suggestedItem, isSurpriseForUser: false })).toBe(true);
      expect(WishlistItem.canDisplaySensitiveInformations({ isSurpriseForUser: false })).toBe(true);
    });
  });
});
