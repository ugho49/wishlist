import { uuid } from '@wishlist/common'
import { AttendeeRole, Authorities } from '@wishlist/common-types'
import { DataSource } from 'typeorm'

import { PasswordManager } from '../../domain/auth'
import { SignedAs } from './use-test-app'

export class Fixtures {
  static readonly USER_TABLE = '"user"'
  static readonly USER_EMAIL_SETTING_TABLE = 'user_email_setting'
  static readonly USER_PASSWORD_VERIFICATION_TABLE = 'user_password_verification'
  static readonly EVENT_TABLE = 'event'
  static readonly EVENT_ATTENDEE_TABLE = 'event_attendee'
  static readonly EVENT_WISHLIST_TABLE = 'event_wishlist'
  static readonly WISHLIST_TABLE = 'wishlist'
  static readonly DEFAULT_USER_PASSWORD = 'Password123'
  static readonly BASE_USER_EMAIL = 'test@test.fr'
  static readonly ADMIN_USER_EMAIL = 'admin@admin.fr'

  private constructor(private readonly datasource: DataSource) {}

  static create(datasource: DataSource): Fixtures {
    return new Fixtures(datasource)
  }

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

    const result = await this.datasource.query(`SELECT id FROM ${Fixtures.USER_TABLE} WHERE email = $1`, [email])

    if (result.length > 1) {
      throw new Error(`Multiple users found for email: ${email}`)
    }

    if (result.length === 0) {
      throw new Error(`No user found for email: ${email}`)
    }

    return result[0]['id']
  }

  async insertUser(parameters: {
    email: string
    firstname: string
    lastname: string
    password?: string
    authorities?: Authorities[]
  }): Promise<string> {
    const query = `INSERT INTO ${Fixtures.USER_TABLE} (id, email, first_name, last_name, password_enc, authorities) VALUES ($1, $2, $3, $4, $5, $6)`
    const id = uuid()
    const { email, firstname, lastname, password, authorities } = parameters
    const passwordEnc = await PasswordManager.hash(password ?? Fixtures.DEFAULT_USER_PASSWORD)
    await this.datasource.query(query, [
      id,
      email,
      firstname,
      lastname,
      passwordEnc,
      authorities ?? [Authorities.ROLE_USER],
    ])
    return id
  }

  async insertAdminUser(): Promise<string> {
    return this.insertUser({
      email: Fixtures.ADMIN_USER_EMAIL,
      firstname: 'Admin',
      lastname: 'ADMIN',
      authorities: [Authorities.ROLE_ADMIN],
    })
  }

  async insertBaseUser(): Promise<string> {
    return this.insertUser({
      email: Fixtures.BASE_USER_EMAIL,
      firstname: 'John',
      lastname: 'Doe',
      authorities: [Authorities.ROLE_USER],
    })
  }

  async insertEvent(parameters: { title: string; description: string; eventDate: Date }): Promise<string> {
    const query = `INSERT INTO ${Fixtures.EVENT_TABLE} (id, title, description, event_date) VALUES ($1, $2, $3, $4)`
    const { title, description, eventDate } = parameters
    const id = uuid()
    await this.datasource.query(query, [id, title, description, eventDate])
    return id
  }

  async insertEventWithMaintainer(parameters: {
    title: string
    description: string
    eventDate: Date
    maintainerId: string
  }): Promise<{ eventId: string; attendeeId: string }> {
    const eventId = await this.insertEvent(parameters)
    const attendeeId = await this.insertMaintainerAttendee({ eventId, userId: parameters.maintainerId })
    return { eventId, attendeeId }
  }

  async insertWishlist(parameters: {
    eventId: string
    userId: string
    title: string
    description?: string
    hideItems?: boolean
  }): Promise<string> {
    const insertWishlistQuery = `INSERT INTO ${Fixtures.WISHLIST_TABLE} (id, title, description, owner_id, hide_items) VALUES ($1, $2, $3, $4, $5)`
    const insertEventWishlistQuery = `INSERT INTO ${Fixtures.EVENT_WISHLIST_TABLE} (event_id, wishlist_id) VALUES ($1, $2)`
    const id = uuid()
    const { eventId, title, description, userId, hideItems } = parameters
    await this.datasource.query(insertWishlistQuery, [id, title, description ?? null, userId, hideItems ?? true])
    await this.datasource.query(insertEventWishlistQuery, [eventId, id])
    return id
  }

  async insertPendingAttendee(parameters: {
    eventId: string
    tempUserEmail: string
    role?: AttendeeRole
  }): Promise<string> {
    const query = `INSERT INTO ${Fixtures.EVENT_ATTENDEE_TABLE} (id, event_id, temp_user_email, role) VALUES ($1, $2, $3, $4)`
    const id = uuid()
    const { eventId, tempUserEmail, role } = parameters
    await this.datasource.query(query, [id, eventId, tempUserEmail, role ?? AttendeeRole.USER])
    return id
  }

  async insertActiveAttendee(parameters: { eventId: string; userId: string; role?: AttendeeRole }): Promise<string> {
    const query = `INSERT INTO ${Fixtures.EVENT_ATTENDEE_TABLE} (id, event_id, user_id, role) VALUES ($1, $2, $3, $4)`
    const id = uuid()
    const { eventId, userId, role } = parameters
    await this.datasource.query(query, [id, eventId, userId, role ?? AttendeeRole.USER])
    return id
  }

  async insertMaintainerAttendee(parameters: { eventId: string; userId: string }): Promise<string> {
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
    const query = `INSERT INTO ${Fixtures.USER_PASSWORD_VERIFICATION_TABLE} (id, user_id, token, expired_at) VALUES ($1, $2, $3, $4)`
    const { userId, token, expiredAt } = parameters
    const id = uuid()
    await this.datasource.query(query, [id, userId, token, expiredAt])
    return id
  }
}
