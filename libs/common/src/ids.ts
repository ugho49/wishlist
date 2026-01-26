type Brand<T, U> = T & { __brand: U }

export type EventId = Brand<string, 'EventId'>
export type AttendeeId = Brand<string, 'AttendeeId'>
export type SecretSantaUserId = Brand<string, 'SecretSantaUserId'>
export type SecretSantaId = Brand<string, 'SecretSantaId'>
export type UserPasswordVerificationId = Brand<string, 'UserPasswordVerificationId'>
export type UserEmailChangeVerificationId = Brand<string, 'UserEmailChangeVerificationId'>
export type UserId = Brand<string, 'UserId'>
export type UserSocialId = Brand<string, 'UserSocialId'>
export type UserEmailSettingId = Brand<string, 'UserEmailSettingId'>
export type ItemId = Brand<string, 'ItemId'>
export type WishlistId = Brand<string, 'WishlistId'>

export type Ids = {
  EventId: EventId
  AttendeeId: AttendeeId
  SecretSantaUserId: SecretSantaUserId
  SecretSantaId: SecretSantaId
  UserPasswordVerificationId: UserPasswordVerificationId
  UserEmailChangeVerificationId: UserEmailChangeVerificationId
  UserId: UserId
  UserSocialId: UserSocialId
  UserEmailSettingId: UserEmailSettingId
  ItemId: ItemId
  WishlistId: WishlistId
}

const getBrandedType = (type: keyof Ids): string => `Ids["${type}"]`

export const gqlScalarIds: Record<keyof Ids, string> = {
  EventId: getBrandedType('EventId'),
  WishlistId: getBrandedType('WishlistId'),
  AttendeeId: getBrandedType('AttendeeId'),
  UserId: getBrandedType('UserId'),
  UserSocialId: getBrandedType('UserSocialId'),
  UserEmailSettingId: getBrandedType('UserEmailSettingId'),
  UserEmailChangeVerificationId: getBrandedType('UserEmailChangeVerificationId'),
  UserPasswordVerificationId: getBrandedType('UserPasswordVerificationId'),
  SecretSantaId: getBrandedType('SecretSantaId'),
  SecretSantaUserId: getBrandedType('SecretSantaUserId'),
  ItemId: getBrandedType('ItemId'),
}
