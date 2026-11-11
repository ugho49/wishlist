import type {
  AttendeeId,
  EventId,
  ItemId,
  SecretSantaId,
  SecretSantaUserId,
  UserAccountId,
  UserId,
  UserSessionId,
  WishlistId,
} from '@wishlist/common';

import { scalar } from '@znight/graphql';

/**
 * The branded UUID scalars of the schema (`scalar EventId`...). They have no runtime format of their
 * own: values are passed through as is, like the previous schema-first server did.
 */
const identity = <T>(value: unknown): T => value as T;

export const AttendeeIdScalar = scalar<AttendeeId>('AttendeeId', { serialize: identity, parseValue: identity });
export const EventIdScalar = scalar<EventId>('EventId', { serialize: identity, parseValue: identity });
export const ItemIdScalar = scalar<ItemId>('ItemId', { serialize: identity, parseValue: identity });
export const SecretSantaIdScalar = scalar<SecretSantaId>('SecretSantaId', {
  serialize: identity,
  parseValue: identity,
});
export const SecretSantaUserIdScalar = scalar<SecretSantaUserId>('SecretSantaUserId', {
  serialize: identity,
  parseValue: identity,
});
export const UserAccountIdScalar = scalar<UserAccountId>('UserAccountId', {
  serialize: identity,
  parseValue: identity,
});
export const UserIdScalar = scalar<UserId>('UserId', { serialize: identity, parseValue: identity });
export const UserSessionIdScalar = scalar<UserSessionId>('UserSessionId', {
  serialize: identity,
  parseValue: identity,
});
export const WishlistIdScalar = scalar<WishlistId>('WishlistId', { serialize: identity, parseValue: identity });
