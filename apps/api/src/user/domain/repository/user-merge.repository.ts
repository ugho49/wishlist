import type { AttendeeId, EventId, SecretSantaUserId, UserAccountId, UserId, WishlistId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { AttendeeRole } from '../../../event/domain/attendee-role.enum';

/** An event the user attends (as a registered attendee, not a pending email). */
export type UserMergeAttendance = {
  attendeeId: AttendeeId;
  eventId: EventId;
  eventTitle: string;
  eventIcon?: string;
  eventDate: Date;
  role: AttendeeRole;
  /** Set when the attendee takes part in the secret santa of the event. */
  secretSantaUserId?: SecretSantaUserId;
};

/** A wishlist the user owns or co-owns. */
export type UserMergeWishlist = {
  id: WishlistId;
  title: string;
  logoUrl?: string;
  ownerId: UserId;
  coOwnerId?: UserId;
  eventIds: EventId[];
  itemCount: number;
};

/** What a user brings to a merge, besides the profile and the login accounts. */
export type UserMergeFootprint = {
  attendances: UserMergeAttendance[];
  wishlists: UserMergeWishlist[];
  reservedItemCount: number;
};

/**
 * The rows to move from the merged user (source) to the kept user (target). Everything left on the source
 * goes away with it when it is deleted.
 */
export type UserMergeTransfer = {
  sourceUserId: UserId;
  targetUserId: UserId;
  /** Source login accounts given to the target. */
  accountIds: UserAccountId[];
  /** Target login accounts deleted first: a source account of the same provider replaces them. */
  replacedTargetAccountIds: UserAccountId[];
  /** Source attendances moved to the target (events the target does not attend). */
  attendeeIds: AttendeeId[];
  /** Target attendances of shared events that take the source's higher role. */
  attendeeRoleUpdates: Array<{ attendeeId: AttendeeId; role: AttendeeRole }>;
  /** Source secret santa participations moved onto the target's attendance of the same event. */
  secretSantaUserMoves: Array<{ secretSantaUserId: SecretSantaUserId; attendeeId: AttendeeId }>;
  /** Wishlists owned by the source that the target now owns (the target stops being their co-owner). */
  ownedWishlistIds: WishlistId[];
  /** Wishlists co-owned by the source that the target now co-owns. */
  coOwnedWishlistIds: WishlistId[];
  /** Move the source's item reservations (a reservation both users hold is kept once). */
  transferReservations: boolean;
};

export interface UserMergeRepository {
  findFootprint(userId: UserId): Promise<UserMergeFootprint>;
  transfer(transfer: UserMergeTransfer, tx: DrizzleTransaction): Promise<void>;
}
