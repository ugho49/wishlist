import { Brand } from '@wishlist/common'

export type EventId = Brand<string, 'EventId'>
export type EventAttendeeId = Brand<string, 'EventAttendeeId'>
export type WishlistId = Brand<string, 'WishlistId'>
export type ItemId = Brand<string, 'ItemId'>
export type SecretSantaId = Brand<string, 'SecretSantaId'>
export type UserPasswordVerificationId = Brand<string, 'UserPasswordVerificationId'>
export type SecretSantaUserId = Brand<string, 'SecretSantaUserId'>

export * from './user'
export * from './user-social'
export * from './user-email-settings'
