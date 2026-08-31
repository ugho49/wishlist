import type {
  AttendeeId,
  EventId,
  ItemId,
  SecretSantaId,
  SecretSantaUserId,
  UserAccountId,
  UserEmailChangeVerificationId,
  UserEmailSettingId,
  UserId,
  UserPasswordVerificationId,
  UserRefreshTokenId,
  WishlistId,
} from '@wishlist/common';

import { brandedUuid } from './helpers';

export const eventId = brandedUuid<EventId>();
export const attendeeId = brandedUuid<AttendeeId>();
export const userId = brandedUuid<UserId>();
export const userPasswordVerificationId = brandedUuid<UserPasswordVerificationId>();
export const userEmailChangeVerificationId = brandedUuid<UserEmailChangeVerificationId>();
export const userEmailSettingId = brandedUuid<UserEmailSettingId>();
export const userAccountId = brandedUuid<UserAccountId>();
export const userRefreshTokenId = brandedUuid<UserRefreshTokenId>();
export const secretSantaId = brandedUuid<SecretSantaId>();
export const secretSantaUserId = brandedUuid<SecretSantaUserId>();
export const wishlistId = brandedUuid<WishlistId>();
export const itemId = brandedUuid<ItemId>();
