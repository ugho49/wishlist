import { uuid } from '@wishlist/common'
import { Authorities } from '@wishlist/common-types'
import { DataSource } from 'typeorm'

import { PasswordManager } from '../../domain/auth'

export const USER_TABLE = '"user"'
export const USER_EMAIL_SETTING_TABLE = 'user_email_setting'
export const EVENT_TABLE = 'event'
export const EVENT_ATTENDEE_TABLE = 'event_attendee'

export const DEFAULT_USER_PASSWORD = 'Password123'
export const BASE_USER_EMAIL = 'test@test.fr'
export const ADMIN_USER_EMAIL = 'admin@admin.fr'

export const insertUser = (
  datasource: DataSource,
  parameters: {
    id: string
    email: string
    firstname: string
    lastname: string
    password_enc: string
    authorities?: Authorities[]
  },
) => {
  const query = `INSERT INTO ${USER_TABLE} (id, email, first_name, last_name, password_enc, authorities) VALUES ($1, $2, $3, $4, $5, $6)`
  const { id, email, firstname, lastname, password_enc, authorities } = parameters
  return datasource.query(query, [id, email, firstname, lastname, password_enc, authorities ?? [Authorities.ROLE_USER]])
}

export const insertAdminUser = async (datasource: DataSource): Promise<string> => {
  const passwordEnc = await PasswordManager.hash(DEFAULT_USER_PASSWORD)
  const id = uuid()

  await insertUser(datasource, {
    id,
    email: ADMIN_USER_EMAIL,
    firstname: 'Admin',
    lastname: 'ADMIN',
    password_enc: passwordEnc,
    authorities: [Authorities.ROLE_ADMIN],
  })

  return id
}

export const insertBaseUser = async (datasource: DataSource): Promise<string> => {
  const passwordEnc = await PasswordManager.hash(DEFAULT_USER_PASSWORD)
  const id = uuid()

  await insertUser(datasource, {
    id,
    email: BASE_USER_EMAIL,
    firstname: 'John',
    lastname: 'Doe',
    password_enc: passwordEnc,
    authorities: [Authorities.ROLE_USER],
  })

  return id
}

export const insertEvent = (
  datasource: DataSource,
  parameters: { id: string; title: string; description: string; eventDate: Date; creatorId: string },
) => {
  const query = `INSERT INTO ${EVENT_TABLE} (id, title, description, event_date, creator_id) VALUES ($1, $2, $3, $4, $5)`
  const { id, title, description, eventDate, creatorId } = parameters
  return datasource.query(query, [id, title, description, eventDate, creatorId])
}

export const insertPendingAttendee = (
  datasource: DataSource,
  parameters: { id: string; eventId: string; tempUserEmail: string },
) => {
  const query = `INSERT INTO ${EVENT_ATTENDEE_TABLE} (id, event_id, temp_user_email) VALUES ($1, $2, $3)`
  const { id, eventId, tempUserEmail } = parameters
  return datasource.query(query, [id, eventId, tempUserEmail])
}

export const insertActiveAttendee = (
  datasource: DataSource,
  parameters: { id: string; eventId: string; userId: string },
) => {
  const query = `INSERT INTO ${EVENT_ATTENDEE_TABLE} (id, event_id, user_id) VALUES ($1, $2, $3)`
  const { id, eventId, userId } = parameters
  return datasource.query(query, [id, eventId, userId])
}
