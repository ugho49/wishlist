import type { EventId, UserAccountId, UserId, WishlistId } from '@wishlist/common';
import type { AdminMergeUsersInput, AdminUserMergeCandidateFieldsFragment } from '../../../../gql';

import { AdminUserMergeSide, AttendeeRole } from '../../../../gql';

export type MergeCandidate = AdminUserMergeCandidateFieldsFragment;
export type MergeUser = MergeCandidate['user'];
export type MergeEvent = MergeCandidate['events'][number];
export type MergeWishlist = MergeCandidate['wishlists'][number];
export type MergeAccount = MergeUser['accounts'][number];

export type MergeProfileField = keyof AdminMergeUsersInput['profile'];

export const MERGE_PROFILE_FIELDS: MergeProfileField[] = ['email', 'firstName', 'lastName', 'birthday', 'picture'];

export type MergeSelection = {
  profile: Record<MergeProfileField, AdminUserMergeSide>;
  accountIds: UserAccountId[];
  /** Events only the source attends that the target joins */
  eventIds: EventId[];
  wishlistIds: WishlistId[];
  transferReservations: boolean;
};

export const getProfileValue = (user: MergeUser, field: MergeProfileField): string | null =>
  field === 'picture' ? user.pictureUrl : user[field];

export const getSharedEventIds = (source: MergeCandidate, target: MergeCandidate): Set<EventId> => {
  const targetEventIds = new Set(target.events.map(event => event.id));
  return new Set(source.events.filter(event => targetEventIds.has(event.id)).map(event => event.id));
};

export const getSourceOnlyEvents = (source: MergeCandidate, target: MergeCandidate): MergeEvent[] => {
  const shared = getSharedEventIds(source, target);
  return source.events.filter(event => !shared.has(event.id));
};

/** Shared events where both users take part in the secret santa: the merge cannot go through. */
export const getSecretSantaConflicts = (source: MergeCandidate, target: MergeCandidate): MergeEvent[] => {
  const targetInSecretSanta = new Set(target.events.filter(event => event.inSecretSanta).map(event => event.id));
  return source.events.filter(event => event.inSecretSanta && targetInSecretSanta.has(event.id));
};

/** A source wishlist co-owned by the source but owned by the target: nothing to transfer. */
export const isOwnedByTarget = (wishlist: MergeWishlist, target: MergeCandidate): boolean =>
  wishlist.isCoOwner && target.wishlists.some(w => w.id === wishlist.id && !w.isCoOwner);

const ROLE_RANK: Record<AttendeeRole, number> = {
  [AttendeeRole.Participant]: 0,
  [AttendeeRole.Admin]: 1,
  [AttendeeRole.Creator]: 2,
};

export const highestRole = (a: AttendeeRole, b: AttendeeRole): AttendeeRole => (ROLE_RANK[a] >= ROLE_RANK[b] ? a : b);

export const getDefaultSelection = (source: MergeCandidate, target: MergeCandidate): MergeSelection => {
  const targetProviders = new Set(target.user.accounts.map(account => account.provider));
  const profile = Object.fromEntries(
    MERGE_PROFILE_FIELDS.map(field => [
      field,
      // Keep the target's values, unless it has none and the source has one
      !getProfileValue(target.user, field) && getProfileValue(source.user, field)
        ? AdminUserMergeSide.Source
        : AdminUserMergeSide.Target,
    ]),
  ) as MergeSelection['profile'];

  return {
    profile,
    accountIds: source.user.accounts
      .filter(account => !targetProviders.has(account.provider))
      .map(account => account.id),
    eventIds: getSourceOnlyEvents(source, target).map(event => event.id),
    wishlistIds: source.wishlists.filter(wishlist => !isOwnedByTarget(wishlist, target)).map(wishlist => wishlist.id),
    transferReservations: source.reservedItemCount > 0,
  };
};

/** Why a source-only event cannot be left behind, if it cannot. */
export const getEventLockReason = (
  event: MergeEvent,
  selection: MergeSelection,
  source: MergeCandidate,
): string | undefined => {
  if (event.role === AttendeeRole.Creator) {
    return 'Créé par ce compte';
  }

  if (event.inSecretSanta) {
    return 'Participe au secret santa';
  }

  const requiredBy = source.wishlists.find(
    wishlist =>
      !wishlist.isCoOwner && selection.wishlistIds.includes(wishlist.id) && wishlist.eventIds.includes(event.id),
  );

  return requiredBy ? `Requis par la liste « ${requiredBy.title} »` : undefined;
};

const toggle = <T>(values: T[], value: T, selected: boolean): T[] => {
  const without = values.filter(v => v !== value);
  return selected ? [...without, value] : without;
};

export const setAccountSelected = (
  selection: MergeSelection,
  accountId: UserAccountId,
  selected: boolean,
): MergeSelection => ({ ...selection, accountIds: toggle(selection.accountIds, accountId, selected) });

export const setEventSelected = (selection: MergeSelection, eventId: EventId, selected: boolean): MergeSelection => ({
  ...selection,
  eventIds: toggle(selection.eventIds, eventId, selected),
});

/** Keeping an owned wishlist also keeps the source-only events it is linked to. */
export const setWishlistSelected = (
  selection: MergeSelection,
  wishlist: MergeWishlist,
  selected: boolean,
  sourceOnlyEvents: MergeEvent[],
): MergeSelection => {
  const wishlistIds = toggle(selection.wishlistIds, wishlist.id, selected);

  if (!selected || wishlist.isCoOwner) {
    return { ...selection, wishlistIds };
  }

  const requiredEventIds = sourceOnlyEvents.map(event => event.id).filter(id => wishlist.eventIds.includes(id));
  return { ...selection, wishlistIds, eventIds: [...new Set([...selection.eventIds, ...requiredEventIds])] };
};

export const toMergeUsersInput = (params: {
  sourceUserId: UserId;
  targetUserId: UserId;
  selection: MergeSelection;
}): AdminMergeUsersInput => ({
  sourceUserId: params.sourceUserId,
  targetUserId: params.targetUserId,
  profile: params.selection.profile,
  accountIds: params.selection.accountIds,
  eventIds: params.selection.eventIds,
  wishlistIds: params.selection.wishlistIds,
  transferReservations: params.selection.transferReservations,
});
