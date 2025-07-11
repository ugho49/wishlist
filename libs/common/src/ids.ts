type Brand<T, U> = T & { __brand: U }

export type EventId = Brand<string, 'EventId'>
export type AttendeeId = Brand<string, 'AttendeeId'>
export type SecretSantaUserId = Brand<string, 'SecretSantaUserId'>
export type SecretSantaId = Brand<string, 'SecretSantaId'>
export type UserPasswordVerificationId = Brand<string, 'UserPasswordVerificationId'>
export type UserId = Brand<string, 'UserId'>
export type UserSocialId = Brand<string, 'UserSocialId'>
export type UserEmailSettingId = Brand<string, 'UserEmailSettingId'>
export type ItemId = Brand<string, 'ItemId'>
export type WishlistId = Brand<string, 'WishlistId'>
