import type { DrizzleDatabase } from '@wishlist/api/core'
import type { UserId } from '@wishlist/common'
import type { InferInsertModel } from 'drizzle-orm'

import { faker } from '@faker-js/faker'
import { PasswordManager } from '@wishlist/api/auth'
import { schema } from '@wishlist/api-drizzle'
import { AttendeeRole, Authorities, uuid } from '@wishlist/common'

import { ADMIN_USER_EMAIL, BASE_USER_EMAIL, DEFAULT_USER_PASSWORD } from './constants'
import { createEventAttendeeFactory } from './event-attendee.factory'
import { insertRow, type LooseInsert } from './insert-row'

type UserInsert = InferInsertModel<typeof schema.user>

export type CreateUserOverrides = LooseInsert<UserInsert> & {
  password?: string
}

let defaultPasswordHash: string | undefined

async function resolvePasswordEnc(overrides: CreateUserOverrides): Promise<string | null | undefined> {
  if (overrides.passwordEnc !== undefined) {
    return overrides.passwordEnc
  }

  if (overrides.password !== undefined) {
    return PasswordManager.hash(overrides.password)
  }

  if (!defaultPasswordHash) {
    defaultPasswordHash = await PasswordManager.hash(DEFAULT_USER_PASSWORD)
  }

  return defaultPasswordHash
}

export function createUserFactory(db: DrizzleDatabase) {
  const attendees = createEventAttendeeFactory(db)

  return {
    async create(overrides: CreateUserOverrides = {}) {
      const { password: _password, passwordEnc: _passwordEnc, ...rest } = overrides
      const passwordEnc = await resolvePasswordEnc(overrides)

      return insertRow(db, schema.user, {
        id: uuid() as UserId,
        email: faker.internet.email().toLowerCase(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        authorities: [Authorities.ROLE_USER],
        isEnabled: true,
        passwordEnc,
        ...rest,
      } as UserInsert)
    },

    createBase(overrides: CreateUserOverrides = {}) {
      return this.create({
        email: BASE_USER_EMAIL,
        firstName: 'John',
        lastName: 'Doe',
        authorities: [Authorities.ROLE_USER],
        ...overrides,
      })
    },

    createAdmin(overrides: CreateUserOverrides = {}) {
      return this.create({
        email: ADMIN_USER_EMAIL,
        firstName: 'Admin',
        lastName: 'ADMIN',
        authorities: [Authorities.ROLE_ADMIN],
        ...overrides,
      })
    },

    async createAndJoinEvent(overrides: CreateUserOverrides & { eventId: string; role?: AttendeeRole }): Promise<{
      user: typeof schema.user.$inferSelect
      attendee: typeof schema.eventAttendee.$inferSelect
    }> {
      const { eventId, role, ...userOverrides } = overrides
      const user = await this.create(userOverrides)
      const attendee = await attendees.create({
        eventId,
        userId: user.id,
        role: role ?? AttendeeRole.USER,
      })

      return { user, attendee }
    },
  }
}
