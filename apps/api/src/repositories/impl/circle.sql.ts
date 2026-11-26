import type { UserId } from '@wishlist/common';
import type { DrizzleDatabase } from '../../core/database/database.factory';

import { schema } from '@wishlist/api-drizzle';
import { and, eq, inArray, isNotNull, ne, notInArray, or, type SQL } from 'drizzle-orm';

import { UserContactStatus } from '../../user/domain/user-contact-status.enum';

/** Events the user attends. */
export function eventIdsOf(db: DrizzleDatabase, userId: UserId) {
  return db
    .select({ eventId: schema.eventAttendee.eventId })
    .from(schema.eventAttendee)
    .where(eq(schema.eventAttendee.userId, userId));
}

/** Users attending at least one event with the user. */
function coAttendeeIds(db: DrizzleDatabase, userId: UserId) {
  return db
    .selectDistinct({ userId: schema.eventAttendee.userId })
    .from(schema.eventAttendee)
    .where(and(isNotNull(schema.eventAttendee.userId), inArray(schema.eventAttendee.eventId, eventIdsOf(db, userId))));
}

/** Users the user decided something about (added as friend, or hidden). */
function contactIds(db: DrizzleDatabase, userId: UserId, status: UserContactStatus) {
  return db
    .select({ userId: schema.userContact.contactUserId })
    .from(schema.userContact)
    .where(and(eq(schema.userContact.ownerUserId, userId), eq(schema.userContact.status, status)));
}

/**
 * Condition on `schema.user` matching the user's circle: the enabled users who attend an event with
 * them or that they added by email, minus the ones they hid, never themselves. Searching other users
 * is restricted to it, so the user base can never be listed.
 */
export function inCircleOf(db: DrizzleDatabase, userId: UserId): SQL {
  return and(
    ne(schema.user.id, userId),
    eq(schema.user.isEnabled, true),
    or(
      inArray(schema.user.id, coAttendeeIds(db, userId)),
      inArray(schema.user.id, contactIds(db, userId, UserContactStatus.ADDED)),
    ),
    notInArray(schema.user.id, contactIds(db, userId, UserContactStatus.HIDDEN)),
  ) as SQL;
}
