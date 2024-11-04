import {
  AttendeeRole,
  Authorities,
  EventAttendeeId,
  EventId,
  ItemId,
  SecretSantaId,
  SecretSantaUserId,
  UserEmailSettingId,
  UserId,
  UserPasswordVerificationId,
  UserSocialId,
  UserSocialType,
  WishlistId,
} from '@wishlist/domain'
import { type ColumnType, type Kysely } from 'kysely'

type GeneratedId<B> = ColumnType<B, B, never>
type CreatedAt = ColumnType<Date, Date, never>
type UpdatedAt = ColumnType<Date, Date, Date>

export const DATABASE = Symbol('DATABASE')

export interface EventTable {
  id: GeneratedId<EventId>
  title: string
  description: string | null
  event_date: Date
  created_at: CreatedAt
  updated_at: UpdatedAt
}

export interface EventAttendeeTable {
  id: GeneratedId<EventAttendeeId>
  event_id: EventId
  role: AttendeeRole
  temp_user_email: string | null
  user_id: string | null
}

export interface WishlistTable {
  id: GeneratedId<WishlistId>
  description: string | null
  hide_items: boolean
  logo_url: string | null
  owner_id: string
  title: string
  created_at: CreatedAt
  updated_at: UpdatedAt
}

export interface EventWishlistTable {
  event_id: EventId
  wishlist_id: WishlistId
}

export interface ItemTable {
  id: GeneratedId<ItemId>
  description: string | null
  is_suggested: boolean
  name: string
  picture_url: string | null
  score: number | null
  taken_at: Date | null
  taker_id: string | null
  url: string | null
  wishlist_id: WishlistId
  updated_at: UpdatedAt
  created_at: CreatedAt
}

export interface UserTable {
  id: GeneratedId<UserId>
  authorities: Authorities[]
  birthday: Date | null
  email: string
  first_name: string
  last_name: string
  is_enabled: boolean
  last_connected_at: Date | null
  last_ip: string | null
  password_enc: string | null
  picture_url: string | null
  created_at: CreatedAt
  updated_at: UpdatedAt
}
export interface SecretSantaTable {
  id: GeneratedId<SecretSantaId>
  status: string
  budget: number | null
  description: string | null
  event_id: EventId
  created_at: CreatedAt
  updated_at: UpdatedAt
}

export interface SecretSantaUserTable {
  id: GeneratedId<SecretSantaUserId>
  secret_santa_id: SecretSantaId
  draw_user_id: SecretSantaUserTable | null
  attendee_id: EventAttendeeId
  exclusions: SecretSantaUserId[]
  created_at: CreatedAt
  updated_at: UpdatedAt
}

export interface UserEmailSettingTable {
  id: GeneratedId<UserEmailSettingId>
  user_id: UserId
  daily_new_item_notification: boolean
  created_at: CreatedAt
  updated_at: UpdatedAt
}

export interface UserPasswordVerificationTable {
  id: GeneratedId<UserPasswordVerificationId>
  user_id: UserId
  expired_at: Date
  token: string
  updated_at: UpdatedAt
  created_at: CreatedAt
}

export interface UserSocialTable {
  id: GeneratedId<UserSocialId>
  user_id: UserId
  picture_url: string | null
  social_id: string
  social_type: UserSocialType
  updated_at: UpdatedAt
  created_at: CreatedAt
}

export interface DatabaseSchema {
  event: EventTable
  event_attendee: EventAttendeeTable
  event_wishlist: EventWishlistTable
  item: ItemTable
  secret_santa: SecretSantaTable
  secret_santa_user: SecretSantaUserTable
  user: UserTable
  user_email_setting: UserEmailSettingTable
  user_password_verification: UserPasswordVerificationTable
  user_social: UserSocialTable
  wishlist: WishlistTable
}

export type Database = Kysely<DatabaseSchema>
