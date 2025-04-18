import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>

export type Numeric = ColumnType<string, number | string, number | string>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface Event {
  created_at: Generated<Timestamp>
  description: string | null
  event_date: Timestamp
  id: string
  title: string
  updated_at: Generated<Timestamp>
}

export interface EventAttendee {
  event_id: string
  id: string
  role: Generated<string>
  temp_user_email: string | null
  user_id: string | null
}

export interface EventWishlist {
  event_id: string
  wishlist_id: string
}

export interface Item {
  created_at: Generated<Timestamp>
  description: string | null
  id: string
  is_suggested: Generated<boolean>
  name: string
  picture_url: string | null
  score: number | null
  taken_at: Timestamp | null
  taker_id: string | null
  updated_at: Generated<Timestamp>
  url: string | null
  wishlist_id: string
}

export interface SecretSanta {
  budget: Numeric | null
  created_at: Generated<Timestamp>
  description: string | null
  event_id: string
  id: string
  status: string
  updated_at: Generated<Timestamp>
}

export interface SecretSantaUser {
  attendee_id: string
  created_at: Generated<Timestamp>
  draw_user_id: string | null
  exclusions: Generated<string[]>
  id: string
  secret_santa_id: string
  updated_at: Generated<Timestamp>
}

export interface TypeormMigrations {
  id: Generated<number>
  name: string
  timestamp: Int8
}

export interface User {
  authorities: Generated<string[]>
  birthday: Timestamp | null
  created_at: Generated<Timestamp>
  email: string
  first_name: string
  id: string
  is_enabled: Generated<boolean>
  last_connected_at: Timestamp | null
  last_ip: string | null
  last_name: string
  password_enc: string | null
  picture_url: string | null
  updated_at: Generated<Timestamp>
}

export interface UserEmailSetting {
  created_at: Generated<Timestamp>
  daily_new_item_notification: Generated<boolean>
  id: string
  updated_at: Generated<Timestamp>
  user_id: string
}

export interface UserPasswordVerification {
  created_at: Generated<Timestamp>
  expired_at: Timestamp
  id: string
  token: string
  updated_at: Generated<Timestamp>
  user_id: string
}

export interface UserSocial {
  created_at: Generated<Timestamp>
  id: string
  picture_url: string | null
  social_id: string
  social_type: string
  updated_at: Generated<Timestamp>
  user_id: string
}

export interface Wishlist {
  created_at: Generated<Timestamp>
  description: string | null
  hide_items: Generated<boolean>
  id: string
  logo_url: string | null
  owner_id: string
  title: string
  updated_at: Generated<Timestamp>
}

export interface Database {
  event: Event
  event_attendee: EventAttendee
  event_wishlist: EventWishlist
  item: Item
  secret_santa: SecretSanta
  secret_santa_user: SecretSantaUser
  typeorm_migrations: TypeormMigrations
  user: User
  user_email_setting: UserEmailSetting
  user_password_verification: UserPasswordVerification
  user_social: UserSocial
  wishlist: Wishlist
}
