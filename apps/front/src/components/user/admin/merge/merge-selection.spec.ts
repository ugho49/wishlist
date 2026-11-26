import type { EventId, UserAccountId, UserId, WishlistId } from '@wishlist/common';
import type { MergeCandidate, MergeEvent, MergeWishlist } from './merge-selection';

import { describe, expect, it } from 'vitest';

import { AdminUserMergeSide, AttendeeRole, UserAccountProvider, UserAuthorities } from '../../../../gql';
import {
  getDefaultSelection,
  getEventLockReason,
  getSecretSantaConflicts,
  getSharedEventIds,
  getSourceOnlyEvents,
  highestRole,
  isOwnedByTarget,
  setWishlistSelected,
} from './merge-selection';

const event = (id: string, overrides: Partial<MergeEvent> = {}): MergeEvent => ({
  id: id as EventId,
  title: `Event ${id}`,
  icon: null,
  eventDate: '2026-12-24',
  role: AttendeeRole.Participant,
  inSecretSanta: false,
  ...overrides,
});

const wishlist = (id: string, overrides: Partial<MergeWishlist> = {}): MergeWishlist => ({
  id: id as WishlistId,
  title: `List ${id}`,
  logoUrl: null,
  isCoOwner: false,
  eventIds: [],
  itemCount: 0,
  ...overrides,
});

const candidate = (overrides: {
  id: string;
  email: string;
  birthday?: string | null;
  pictureUrl?: string | null;
  accounts?: Array<{ id: string; provider: UserAccountProvider }>;
  events?: MergeEvent[];
  wishlists?: MergeWishlist[];
  reservedItemCount?: number;
}): MergeCandidate => ({
  user: {
    id: overrides.id as UserId,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: overrides.email,
    birthday: overrides.birthday ?? null,
    pictureUrl: overrides.pictureUrl ?? null,
    isEnabled: true,
    authorities: [UserAuthorities.RoleUser],
    createdAt: '2025-01-01T00:00:00.000Z',
    accounts: (overrides.accounts ?? []).map(account => ({
      id: account.id as UserAccountId,
      provider: account.provider,
      email: overrides.email,
      pictureUrl: null,
    })),
  },
  events: overrides.events ?? [],
  wishlists: overrides.wishlists ?? [],
  reservedItemCount: overrides.reservedItemCount ?? 0,
});

describe('merge selection', () => {
  describe('getDefaultSelection', () => {
    it('keeps the target profile, except the fields only the source fills', () => {
      const source = candidate({ id: 's', email: 'jean@gmail.com', birthday: '1990-05-01', pictureUrl: 'pic.webp' });
      const target = candidate({ id: 't', email: 'jean@work.fr', pictureUrl: 'target.webp' });

      expect(getDefaultSelection(source, target).profile).toEqual({
        email: AdminUserMergeSide.Target,
        firstName: AdminUserMergeSide.Target,
        lastName: AdminUserMergeSide.Target,
        birthday: AdminUserMergeSide.Source,
        picture: AdminUserMergeSide.Target,
      });
    });

    it('keeps the source accounts whose provider the target lacks', () => {
      const source = candidate({
        id: 's',
        email: 's@test.fr',
        accounts: [
          { id: 'source-password', provider: UserAccountProvider.Password },
          { id: 'source-google', provider: UserAccountProvider.Google },
        ],
      });
      const target = candidate({
        id: 't',
        email: 't@test.fr',
        accounts: [{ id: 'target-password', provider: UserAccountProvider.Password }],
      });

      expect(getDefaultSelection(source, target).accountIds).toEqual(['source-google']);
    });

    it('selects every source-only event and every transferable wishlist', () => {
      const source = candidate({
        id: 's',
        email: 's@test.fr',
        events: [event('shared'), event('own')],
        wishlists: [wishlist('mine'), wishlist('owned-by-target', { isCoOwner: true })],
        reservedItemCount: 3,
      });
      const target = candidate({
        id: 't',
        email: 't@test.fr',
        events: [event('shared')],
        wishlists: [wishlist('owned-by-target')],
      });

      const selection = getDefaultSelection(source, target);

      expect(selection.eventIds).toEqual(['own']);
      expect(selection.wishlistIds).toEqual(['mine']);
      expect(selection.transferReservations).toBe(true);
    });

    it('does not transfer reservations when the source has none', () => {
      const source = candidate({ id: 's', email: 's@test.fr' });
      const target = candidate({ id: 't', email: 't@test.fr' });

      expect(getDefaultSelection(source, target).transferReservations).toBe(false);
    });
  });

  describe('events', () => {
    const source = candidate({
      id: 's',
      email: 's@test.fr',
      events: [event('shared', { inSecretSanta: true }), event('own'), event('other')],
    });
    const target = candidate({ id: 't', email: 't@test.fr', events: [event('shared', { inSecretSanta: true })] });

    it('splits shared and source-only events', () => {
      expect([...getSharedEventIds(source, target)]).toEqual(['shared']);
      expect(getSourceOnlyEvents(source, target).map(e => e.id)).toEqual(['own', 'other']);
    });

    it('flags shared events where both users take part in the secret santa', () => {
      expect(getSecretSantaConflicts(source, target).map(e => e.id)).toEqual(['shared']);
    });

    it('keeps the highest role', () => {
      expect(highestRole(AttendeeRole.Participant, AttendeeRole.Creator)).toBe(AttendeeRole.Creator);
      expect(highestRole(AttendeeRole.Admin, AttendeeRole.Participant)).toBe(AttendeeRole.Admin);
    });
  });

  describe('getEventLockReason', () => {
    const own = event('own');
    const linked = wishlist('linked', { eventIds: [own.id] });
    const source = candidate({ id: 's', email: 's@test.fr', events: [own], wishlists: [linked] });
    const base = getDefaultSelection(source, candidate({ id: 't', email: 't@test.fr' }));

    it('locks an event the source created', () => {
      expect(getEventLockReason(event('e', { role: AttendeeRole.Creator }), base, source)).toBe('Créé par ce compte');
    });

    it('locks an event where the source takes part in the secret santa', () => {
      expect(getEventLockReason(event('e', { inSecretSanta: true }), base, source)).toBe('Participe au secret santa');
    });

    it('locks an event a kept wishlist is linked to', () => {
      expect(getEventLockReason(own, base, source)).toBe('Requis par la liste « List linked »');
    });

    it('frees the event once the wishlist is dropped', () => {
      expect(getEventLockReason(own, { ...base, wishlistIds: [] }, source)).toBeUndefined();
    });
  });

  describe('setWishlistSelected', () => {
    it('re-selects the source-only events of a kept wishlist', () => {
      const own = event('own');
      const linked = wishlist('linked', { eventIds: [own.id, 'shared' as EventId] });
      const source = candidate({ id: 's', email: 's@test.fr', events: [own], wishlists: [linked] });
      const target = candidate({ id: 't', email: 't@test.fr' });
      const selection = { ...getDefaultSelection(source, target), eventIds: [], wishlistIds: [] };

      const next = setWishlistSelected(selection, linked, true, getSourceOnlyEvents(source, target));

      expect(next.wishlistIds).toEqual(['linked']);
      expect(next.eventIds).toEqual(['own']);
    });

    it('only drops the wishlist when unselected', () => {
      const linked = wishlist('linked', { eventIds: ['own' as EventId] });
      const source = candidate({ id: 's', email: 's@test.fr', events: [event('own')], wishlists: [linked] });
      const target = candidate({ id: 't', email: 't@test.fr' });
      const selection = getDefaultSelection(source, target);

      const next = setWishlistSelected(selection, linked, false, getSourceOnlyEvents(source, target));

      expect(next.wishlistIds).toEqual([]);
      expect(next.eventIds).toEqual(['own']);
    });
  });

  it('detects a co-owned wishlist the target owns', () => {
    const target = candidate({ id: 't', email: 't@test.fr', wishlists: [wishlist('w')] });

    expect(isOwnedByTarget(wishlist('w', { isCoOwner: true }), target)).toBe(true);
    expect(isOwnedByTarget(wishlist('w'), target)).toBe(false);
  });
});
