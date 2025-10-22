import type {
  AttendeeId,
  EventId,
  ItemId,
  SecretSantaId,
  SecretSantaUserId,
  UserEmailSettingId,
  UserId,
  UserPasswordVerificationId,
  UserSocialId,
  WishlistId,
} from '@wishlist/common'

import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

import { brandedUuid, numericNullable, timestampWithTimezone } from './helpers'

// Custom branded UUID types
const eventId = brandedUuid<EventId>()
const attendeeId = brandedUuid<AttendeeId>()
const userId = brandedUuid<UserId>()
const userPasswordVerificationId = brandedUuid<UserPasswordVerificationId>()
const userEmailSettingId = brandedUuid<UserEmailSettingId>()
const userSocialId = brandedUuid<UserSocialId>()
const secretSantaId = brandedUuid<SecretSantaId>()
const secretSantaUserId = brandedUuid<SecretSantaUserId>()
const wishlistId = brandedUuid<WishlistId>()
const itemId = brandedUuid<ItemId>()

export const event = pgTable('event', {
  id: eventId().primaryKey().notNull(),
  title: varchar({ length: 100 }).notNull(),
  description: text(),
  icon: varchar({ length: 10 }),
  eventDate: date('event_date').notNull(),
  createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
  updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
})

export const eventAttendee = pgTable(
  'event_attendee',
  {
    id: attendeeId().primaryKey().notNull(),
    eventId: eventId('event_id').notNull(),
    userId: userId('user_id'),
    tempUserEmail: varchar('temp_user_email', { length: 200 }),
    role: varchar({ length: 50 }).default('user').notNull(),
  },
  table => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [event.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
    }).onDelete('cascade'),
    unique('event_attendee_event_id_user_id_temp_user_email_key').on(table.eventId, table.userId, table.tempUserEmail),
    check(
      'chk_user',
      sql`((user_id IS NOT NULL) AND (temp_user_email IS NULL)) OR ((user_id IS NULL) AND (temp_user_email IS NOT NULL))`,
    ),
  ],
)

export const userPasswordVerification = pgTable(
  'user_password_verification',
  {
    id: userPasswordVerificationId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    token: varchar({ length: 200 }).notNull(),
    expiredAt: timestampWithTimezone('expired_at').notNull(),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_password_verification_user_id_fkey',
    }).onDelete('cascade'),
  ],
)

export const userEmailSetting = pgTable(
  'user_email_setting',
  {
    id: userEmailSettingId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    dailyNewItemNotification: boolean('daily_new_item_notification').default(true).notNull(),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_email_setting_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_email_setting_user_id_key').on(table.userId),
  ],
)

export const userSocial = pgTable(
  'user_social',
  {
    id: userSocialId().primaryKey().notNull(),
    userId: userId('user_id').notNull(),
    email: varchar({ length: 200 }).notNull(),
    name: varchar({ length: 200 }),
    socialId: varchar('social_id', { length: 1000 }).notNull(),
    socialType: varchar('social_type', { length: 50 }).notNull(),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'user_social_user_id_fkey',
    }).onDelete('cascade'),
    unique('user_social_user_id_social_type_key').on(table.userId, table.socialType),
    unique('user_social_social_id_social_type_key').on(table.socialId, table.socialType),
  ],
)

export const user = pgTable(
  'user',
  {
    id: userId().primaryKey().notNull(),
    email: varchar({ length: 200 }).notNull(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    birthday: date(),
    passwordEnc: varchar('password_enc', { length: 500 }),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    authorities: varchar({ length: 100 }).array().default(['ROLE_USER']).notNull(),
    lastIp: varchar('last_ip', { length: 50 }),
    lastConnectedAt: timestampWithTimezone('last_connected_at'),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
    pictureUrl: varchar('picture_url', { length: 1000 }),
  },
  _ => [uniqueIndex('user_email_unique_idx').using('btree', sql`lower((email)::text)`)],
)

export const wishlist = pgTable(
  'wishlist',
  {
    id: wishlistId().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    description: text(),
    ownerId: userId('owner_id').notNull(),
    hideItems: boolean('hide_items').default(true).notNull(),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
    logoUrl: varchar('logo_url', { length: 1000 }),
  },
  table => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [user.id],
    }).onDelete('cascade'),
  ],
)

export const item = pgTable(
  'item',
  {
    id: itemId().primaryKey().notNull(),
    wishlistId: wishlistId('wishlist_id').notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    url: varchar({ length: 1000 }),
    pictureUrl: varchar('picture_url', { length: 1000 }),
    isSuggested: boolean('is_suggested').default(false).notNull(),
    score: integer(),
    importSourceId: itemId('import_source_id'),
    takerId: userId('taker_id'),
    takenAt: timestampWithTimezone('taken_at'),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.wishlistId],
      foreignColumns: [wishlist.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.takerId],
      foreignColumns: [user.id],
    }).onDelete('set null'),
    foreignKey({
      columns: [table.importSourceId],
      foreignColumns: [table.id],
    }).onDelete('set null'),
    check('chk_import_source_id', sql`import_source_id IS DISTINCT FROM id`),
  ],
)

export const secretSanta = pgTable(
  'secret_santa',
  {
    id: secretSantaId().primaryKey().notNull(),
    eventId: eventId('event_id').notNull(),
    description: text(),
    budget: numericNullable('budget'),
    status: varchar({ length: 20 }).notNull(),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [event.id],
    }).onDelete('cascade'),
    unique().on(table.eventId),
  ],
)

export const secretSantaUser = pgTable(
  'secret_santa_user',
  {
    id: secretSantaUserId().primaryKey().notNull(),
    secretSantaId: secretSantaId('secret_santa_id').notNull(),
    attendeeId: attendeeId('attendee_id').notNull(),
    drawUserId: secretSantaUserId('draw_user_id'),
    exclusions: secretSantaUserId().array().default([]).notNull(),
    createdAt: timestampWithTimezone('created_at').defaultNow().notNull(),
    updatedAt: timestampWithTimezone('updated_at').defaultNow().notNull(),
  },
  table => [
    foreignKey({
      columns: [table.secretSantaId],
      foreignColumns: [secretSanta.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.drawUserId],
      foreignColumns: [table.id],
    }).onDelete('set null'),
    foreignKey({
      columns: [table.attendeeId],
      foreignColumns: [eventAttendee.id],
    }),
    uniqueIndex('secret_santa_user_secret_santa_id_attendee_id_key').on(table.secretSantaId, table.attendeeId),
  ],
)

export const eventWishlist = pgTable(
  'event_wishlist',
  {
    eventId: eventId('event_id').notNull(),
    wishlistId: wishlistId('wishlist_id').notNull(),
  },
  table => [
    primaryKey({ columns: [table.eventId, table.wishlistId] }),
    foreignKey({
      columns: [table.wishlistId],
      foreignColumns: [wishlist.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [event.id],
    }).onDelete('cascade'),
  ],
)
