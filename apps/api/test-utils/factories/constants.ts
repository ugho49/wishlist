import { schema } from '@wishlist/api-drizzle'

export type SignedAs = 'BASE_USER' | 'ADMIN_USER'

export const DEFAULT_USER_PASSWORD = 'Password123'
export const BASE_USER_EMAIL = 'test@test.fr'
export const ADMIN_USER_EMAIL = 'admin@admin.fr'

export const Tables = {
  USER: schema.user,
  USER_EMAIL_SETTING: schema.userEmailSetting,
  USER_PASSWORD_VERIFICATION: schema.userPasswordVerification,
  USER_EMAIL_CHANGE_VERIFICATION: schema.userEmailChangeVerification,
  EVENT: schema.event,
  EVENT_ATTENDEE: schema.eventAttendee,
  EVENT_WISHLIST: schema.eventWishlist,
  WISHLIST: schema.wishlist,
  ITEM: schema.item,
  SECRET_SANTA: schema.secretSanta,
  SECRET_SANTA_USER: schema.secretSantaUser,
} as const
