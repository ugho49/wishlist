import type { SecretSantaStatus } from '@wishlist/common'
import type { Client } from 'pg'
import type { SignedAs } from './use-test-app'

import { PasswordManager } from '@wishlist/api/auth'
import { AttendeeRole, Authorities, uuid } from '@wishlist/common'
import { DateTime } from 'luxon'

export class Fixtures {
  static readonly USER_TABLE = '"user"'
  static readonly USER_EMAIL_SETTING_TABLE = 'user_email_setting'
  static readonly USER_PASSWORD_VERIFICATION_TABLE = 'user_password_verification'
  static readonly EVENT_TABLE = 'event'
  static readonly EVENT_ATTENDEE_TABLE = 'event_attendee'
  static readonly EVENT_WISHLIST_TABLE = 'event_wishlist'
  static readonly WISHLIST_TABLE = 'wishlist'
  static readonly ITEM_TABLE = 'item'
  static readonly SECRET_SANTA_TABLE = 'secret_santa'
  static readonly SECRET_SANTA_USER_TABLE = 'secret_santa_user'
  static readonly DEFAULT_USER_PASSWORD = 'Password123'
  static readonly BASE_USER_EMAIL = 'test@test.fr'
  static readonly ADMIN_USER_EMAIL = 'admin@admin.fr'

  constructor(private readonly client: Client) {}

  async getSignedUserId(signedAs: SignedAs): Promise<string> {
    let email = ''

    switch (signedAs) {
      case 'BASE_USER':
        email = Fixtures.BASE_USER_EMAIL
        break
      case 'ADMIN_USER':
        email = Fixtures.ADMIN_USER_EMAIL
        break
      default:
        throw new Error(`Unknown signedAs value: ${signedAs}`)
    }

    const result = await this.client.query(`SELECT id FROM ${Fixtures.USER_TABLE} WHERE email = $1`, [email])

    if (result.rows.length > 1) {
      throw new Error(`Multiple users found for email: ${email}`)
    }

    if (result.rows.length === 0) {
      throw new Error(`No user found for email: ${email}`)
    }

    return result.rows[0]!.id
  }

  async insertUser(parameters: {
    email: string
    firstname: string
    lastname: string
    password?: string
    authorities?: Authorities[]
  }): Promise<string> {
    const id = uuid()
    const { email, firstname, lastname, password, authorities } = parameters
    const passwordEnc = await PasswordManager.hash(password ?? Fixtures.DEFAULT_USER_PASSWORD)

    await this.client.query(
      `INSERT INTO ${Fixtures.USER_TABLE} (id, email, first_name, last_name, password_enc, authorities) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email, firstname, lastname, passwordEnc, authorities ?? [Authorities.ROLE_USER]],
    )

    return id
  }

  async insertUserAndAddItToEventAsAttendee(
    parameters: Parameters<typeof this.insertUser>[0] & { eventId: string },
  ): Promise<{ userId: string; attendeeId: string }> {
    const userId = await this.insertUser(parameters)
    const attendeeId = await this.insertActiveAttendee({ eventId: parameters.eventId, userId })
    return { userId, attendeeId }
  }

  insertAdminUser(): Promise<string> {
    return this.insertUser({
      email: Fixtures.ADMIN_USER_EMAIL,
      firstname: 'Admin',
      lastname: 'ADMIN',
      authorities: [Authorities.ROLE_ADMIN],
    })
  }

  insertBaseUser(): Promise<string> {
    return this.insertUser({
      email: Fixtures.BASE_USER_EMAIL,
      firstname: 'John',
      lastname: 'Doe',
      authorities: [Authorities.ROLE_USER],
    })
  }

  async insertUserEmailSettings(parameters: {
    userId: string
    emailSettings: { daily_new_item_notification: boolean }
  }): Promise<string> {
    const { userId, emailSettings } = parameters
    const id = uuid()

    await this.client.query(
      `INSERT INTO ${Fixtures.USER_EMAIL_SETTING_TABLE} (id, user_id, daily_new_item_notification) VALUES ($1, $2, $3)`,
      [id, userId, emailSettings.daily_new_item_notification],
    )

    return id
  }

  async insertEvent(parameters: {
    title: string
    description?: string
    icon?: string
    eventDate: Date
  }): Promise<string> {
    const id = uuid()
    const { title, description, icon, eventDate } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.EVENT_TABLE} (id, title, description, icon, event_date) VALUES ($1, $2, $3, $4, $5)`,
      [id, title, description, icon, eventDate.toISOString().split('T')[0] as string],
    )

    return id
  }

  async insertEventWithMaintainer(parameters: {
    title: string
    description?: string
    icon?: string
    eventDate?: Date
    maintainerId: string
  }): Promise<{ eventId: string; attendeeId: string; eventDate: DateTime }> {
    const eventDate = parameters.eventDate ?? DateTime.now().plus({ days: 30 }).toJSDate()
    const eventId = await this.insertEvent({ ...parameters, eventDate })
    const attendeeId = await this.insertMaintainerAttendee({ eventId, userId: parameters.maintainerId })
    return { eventId, attendeeId, eventDate: DateTime.fromJSDate(eventDate) }
  }

  async insertWishlist(parameters: {
    eventIds: string[]
    userId: string
    title: string
    description?: string
    hideItems?: boolean
    coOwnerId?: string
  }): Promise<string> {
    const id = uuid()
    const { eventIds, title, description, userId, hideItems, coOwnerId } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.WISHLIST_TABLE} (id, title, description, owner_id, hide_items, co_owner_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, title, description, userId, hideItems ?? true, coOwnerId ?? null],
    )

    for (const eventId of eventIds) {
      await this.client.query(`INSERT INTO ${Fixtures.EVENT_WISHLIST_TABLE} (event_id, wishlist_id) VALUES ($1, $2)`, [
        eventId,
        id,
      ])
    }

    return id
  }

  async insertPendingAttendee(parameters: {
    eventId: string
    tempUserEmail: string
    role?: AttendeeRole
  }): Promise<string> {
    const id = uuid()
    const { eventId, tempUserEmail, role } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.EVENT_ATTENDEE_TABLE} (id, event_id, temp_user_email, role) VALUES ($1, $2, $3, $4)`,
      [id, eventId, tempUserEmail, role ?? AttendeeRole.USER],
    )

    return id
  }

  async insertActiveAttendee(parameters: { eventId: string; userId: string; role?: AttendeeRole }): Promise<string> {
    const id = uuid()
    const { eventId, userId, role } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.EVENT_ATTENDEE_TABLE} (id, event_id, user_id, role) VALUES ($1, $2, $3, $4)`,
      [id, eventId, userId, role ?? AttendeeRole.USER],
    )

    return id
  }

  insertMaintainerAttendee(parameters: { eventId: string; userId: string }): Promise<string> {
    return this.insertActiveAttendee({
      eventId: parameters.eventId,
      userId: parameters.userId,
      role: AttendeeRole.MAINTAINER,
    })
  }

  async insertUserPasswordVerification(parameters: {
    userId: string
    token: string
    expiredAt: Date
  }): Promise<string> {
    const { userId, token, expiredAt } = parameters
    const id = uuid()

    await this.client.query(
      `INSERT INTO ${Fixtures.USER_PASSWORD_VERIFICATION_TABLE} (id, user_id, token, expired_at) VALUES ($1, $2, $3, $4)`,
      [id, userId, token, expiredAt],
    )

    return id
  }

  async insertSecretSanta(parameters: {
    eventId: string
    description?: string
    budget?: number
    status: SecretSantaStatus
  }): Promise<string> {
    const id = uuid()
    const { eventId, description, budget, status } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.SECRET_SANTA_TABLE} (id, event_id, description, budget, status) VALUES ($1, $2, $3, $4, $5)`,
      [id, eventId, description ?? null, budget, status],
    )

    return id
  }

  async insertSecretSantaUser(parameters: {
    secretSantaId: string
    attendeeId: string
    drawUserId?: string
    exclusions?: string[]
  }): Promise<string> {
    const id = uuid()
    const { secretSantaId, attendeeId, drawUserId, exclusions } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.SECRET_SANTA_USER_TABLE} (id, secret_santa_id, attendee_id, draw_user_id, exclusions) VALUES ($1, $2, $3, $4, $5)`,
      [id, secretSantaId, attendeeId, drawUserId, exclusions ?? []],
    )

    return id
  }

  async insertItem(parameters: {
    wishlistId: string
    name: string
    description?: string
    url?: string
    isSuggested?: boolean
    score?: number
    takerId?: string
    takenAt?: Date
    pictureUrl?: string
  }): Promise<string> {
    const id = uuid()
    const { wishlistId, name, description, url, isSuggested, score, takerId, takenAt, pictureUrl } = parameters

    await this.client.query(
      `INSERT INTO ${Fixtures.ITEM_TABLE} (id, wishlist_id, name, description, url, is_suggested, score, taker_id, taken_at, picture_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, wishlistId, name, description, url, isSuggested ?? false, score, takerId, takenAt, pictureUrl],
    )

    return id
  }
}
