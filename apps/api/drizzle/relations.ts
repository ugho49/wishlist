import { relations } from 'drizzle-orm/relations'

import {
  event,
  eventAttendee,
  eventWishlist,
  item,
  secretSanta,
  secretSantaUser,
  user,
  userEmailChangeVerification,
  userEmailSetting,
  userPasswordVerification,
  userSocial,
  wishlist,
} from './schema'

export const eventAttendeeRelations = relations(eventAttendee, ({ one, many }) => ({
  event: one(event, {
    fields: [eventAttendee.eventId],
    references: [event.id],
  }),
  user: one(user, {
    fields: [eventAttendee.userId],
    references: [user.id],
  }),
  secretSantaUsers: many(secretSantaUser),
}))

export const eventRelations = relations(event, ({ many }) => ({
  attendees: many(eventAttendee),
  secretSantas: many(secretSanta),
  eventWishlists: many(eventWishlist),
}))

export const userRelations = relations(user, ({ many }) => ({
  passwordVerifications: many(userPasswordVerification),
  emailChangeVerifications: many(userEmailChangeVerification),
  emailSettings: many(userEmailSetting),
  socials: many(userSocial),
  wishlists: many(wishlist, { relationName: 'ownedWishlists' }),
  coOwnedWishlists: many(wishlist, { relationName: 'coOwnedWishlists' }),
  items: many(item),
}))

export const userPasswordVerificationRelations = relations(userPasswordVerification, ({ one }) => ({
  user: one(user, {
    fields: [userPasswordVerification.userId],
    references: [user.id],
  }),
}))

export const userEmailChangeVerificationRelations = relations(userEmailChangeVerification, ({ one }) => ({
  user: one(user, {
    fields: [userEmailChangeVerification.userId],
    references: [user.id],
  }),
}))

export const userEmailSettingRelations = relations(userEmailSetting, ({ one }) => ({
  user: one(user, {
    fields: [userEmailSetting.userId],
    references: [user.id],
  }),
}))

export const userSocialRelations = relations(userSocial, ({ one }) => ({
  user: one(user, {
    fields: [userSocial.userId],
    references: [user.id],
  }),
}))

export const wishlistRelations = relations(wishlist, ({ one, many }) => ({
  owner: one(user, {
    fields: [wishlist.ownerId],
    references: [user.id],
    relationName: 'ownedWishlists',
  }),
  coOwner: one(user, {
    fields: [wishlist.coOwnerId],
    references: [user.id],
    relationName: 'coOwnedWishlists',
  }),
  items: many(item),
  eventWishlists: many(eventWishlist),
}))

export const itemRelations = relations(item, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [item.wishlistId],
    references: [wishlist.id],
  }),
  taker: one(user, {
    fields: [item.takerId],
    references: [user.id],
  }),
}))

export const secretSantaRelations = relations(secretSanta, ({ one, many }) => ({
  event: one(event, {
    fields: [secretSanta.eventId],
    references: [event.id],
  }),
  secretSantaUsers: many(secretSantaUser),
}))

export const secretSantaUserRelations = relations(secretSantaUser, ({ one, many }) => ({
  secretSanta: one(secretSanta, {
    fields: [secretSantaUser.secretSantaId],
    references: [secretSanta.id],
  }),
  secretSantaUser: one(secretSantaUser, {
    fields: [secretSantaUser.drawUserId],
    references: [secretSantaUser.id],
    relationName: 'secretSantaUser_drawUserId_secretSantaUser_id',
  }),
  secretSantaUsers: many(secretSantaUser, {
    relationName: 'secretSantaUser_drawUserId_secretSantaUser_id',
  }),
  eventAttendee: one(eventAttendee, {
    fields: [secretSantaUser.attendeeId],
    references: [eventAttendee.id],
  }),
}))

export const eventWishlistRelations = relations(eventWishlist, ({ one }) => ({
  wishlist: one(wishlist, {
    fields: [eventWishlist.wishlistId],
    references: [wishlist.id],
  }),
  event: one(event, {
    fields: [eventWishlist.eventId],
    references: [event.id],
  }),
}))
