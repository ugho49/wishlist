import type { DatabaseService } from '@wishlist/api/core'
import type {
  AttendeeId,
  EventId,
  ItemId,
  SecretSantaId,
  SecretSantaStatus,
  SecretSantaUserId,
  UserEmailSettingId,
  UserId,
  UserPasswordVerificationId,
  WishlistId,
} from '@wishlist/common'

import type { SignedAs } from './use-test-app'

import { PasswordManager } from '@wishlist/api/auth'
import { AttendeeRole, Authorities, uuid } from '@wishlist/common'
import { eq } from 'drizzle-orm'
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

  private constructor(private readonly databaseService: DatabaseService) {}

  static create(databaseService: DatabaseService): Fixtures {
    return new Fixtures(databaseService)
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

    const { schema, db: client } = this.databaseService

    const result = await client.select().from(schema.user).where(eq(schema.user.email, email))

    if (result.length > 1) {
      throw new Error(`Multiple users found for email: ${email}`)
    }

    if (result.length === 0) {
      throw new Error(`No user found for email: ${email}`)
    }

    return result[0]!.id
  }

  async insertUser(parameters: {
    email: string
    firstname: string
    lastname: string
    password?: string
    authorities?: Authorities[]
  }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const id = uuid() as UserId
    const { email, firstname, lastname, password, authorities } = parameters
    const passwordEnc = await PasswordManager.hash(password ?? Fixtures.DEFAULT_USER_PASSWORD)

    await client.insert(schema.user).values({
      id,
      email,
      firstName: firstname,
      lastName: lastname,
      passwordEnc,
      authorities: authorities ?? [Authorities.ROLE_USER],
    })

    return id
  }

  async insertUserAndAddItToEventAsAttendee(
    parameters: Parameters<typeof this.insertUser>[0] & { eventId: string },
  ): Promise<{ userId: string; attendeeId: string }> {
    const userId = await this.insertUser(parameters)
    const attendeeId = await this.insertActiveAttendee({ eventId: parameters.eventId, userId })
    return { userId, attendeeId }
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

  async insertUserEmailSettings(parameters: {
    userId: string
    emailSettings: { daily_new_item_notification: boolean }
  }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const { userId, emailSettings } = parameters
    const id = uuid() as UserEmailSettingId

    await client.insert(schema.userEmailSetting).values({
      id,
      userId: userId as UserId,
      dailyNewItemNotification: emailSettings.daily_new_item_notification,
    })

    return id
  }

  async insertEvent(parameters: { title: string; description?: string; eventDate: Date }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const id = uuid() as EventId
    const { title, description, eventDate } = parameters
    await client.insert(schema.event).values({
      id,
      title,
      description,
      eventDate: eventDate.toISOString().split('T')[0] as string,
    })
    return id
  }

  async insertEventWithMaintainer(parameters: {
    title: string
    description?: string
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
  }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const id = uuid() as WishlistId
    const { eventIds, title, description, userId, hideItems } = parameters

    await client.insert(schema.wishlist).values({
      id,
      title,
      description: description ?? null,
      ownerId: userId as UserId,
      hideItems: hideItems ?? true,
    })

    await client.insert(schema.eventWishlist).values(
      eventIds.map(eventId => ({
        eventId: eventId as EventId,
        wishlistId: id,
      })),
    )

    return id
  }

  async insertPendingAttendee(parameters: {
    eventId: string
    tempUserEmail: string
    role?: AttendeeRole
  }): Promise<string> {
    const { schema, db: client } = this.databaseService

    const id = uuid() as AttendeeId
    const { eventId, tempUserEmail, role } = parameters

    await client.insert(schema.eventAttendee).values({
      id,
      eventId: eventId as EventId,
      tempUserEmail,
      role: role ?? AttendeeRole.USER,
    })

    return id
  }

  async insertActiveAttendee(parameters: { eventId: string; userId: string; role?: AttendeeRole }): Promise<string> {
    const { schema, db: client } = this.databaseService

    const id = uuid() as AttendeeId
    const { eventId, userId, role } = parameters

    await client.insert(schema.eventAttendee).values({
      id,
      eventId: eventId as EventId,
      userId: userId as UserId,
      role: role ?? AttendeeRole.USER,
    })

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
    const { schema, db: client } = this.databaseService

    const { userId, token, expiredAt } = parameters
    const id = uuid() as UserPasswordVerificationId

    await client.insert(schema.userPasswordVerification).values({
      id,
      userId: userId as UserId,
      token,
      expiredAt,
    })

    return id
  }

  async insertSecretSanta(parameters: {
    eventId: string
    description?: string
    budget?: number
    status: SecretSantaStatus
  }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const id = uuid() as SecretSantaId
    const { eventId, description, budget, status } = parameters

    await client.insert(schema.secretSanta).values({
      id,
      eventId: eventId as EventId,
      description: description ?? null,
      budget,
      status,
    })

    return id
  }

  async insertSecretSantaUser(parameters: {
    secretSantaId: string
    attendeeId: string
    drawUserId?: string
    exclusions?: string[]
  }): Promise<string> {
    const { schema, db: client } = this.databaseService
    const id = uuid() as SecretSantaUserId
    const { secretSantaId, attendeeId, drawUserId, exclusions } = parameters

    await client.insert(schema.secretSantaUser).values({
      id,
      secretSantaId: secretSantaId as SecretSantaId,
      attendeeId: attendeeId as AttendeeId,
      drawUserId: drawUserId ? (drawUserId as SecretSantaUserId) : null,
      exclusions: (exclusions ?? []) as SecretSantaUserId[],
    })

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
    const { schema, db: client } = this.databaseService
    const id = uuid() as ItemId
    const { wishlistId, name, description, url, isSuggested, score, takerId, takenAt, pictureUrl } = parameters

    await client.insert(schema.item).values({
      id,
      wishlistId: wishlistId as WishlistId,
      name,
      description,
      url,
      isSuggested: isSuggested ?? false,
      score,
      takerId: takerId ? (takerId as UserId) : null,
      takenAt,
      pictureUrl,
    })

    return id
  }
}
