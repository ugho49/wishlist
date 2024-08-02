import { DataSource } from 'typeorm'

export const USER_TABLE = '"user"'
export const USER_EMAIL_SETTING_TABLE = 'user_email_setting'
export const EVENT_TABLE = 'event'
export const EVENT_ATTENDEE_TABLE = 'event_attendee'

export const insertUser = (
  datasource: DataSource,
  parameters: {
    id: string
    email: string
    firstname: string
    lastname: string
    password_enc: string
  },
) => {
  const query = `INSERT INTO ${USER_TABLE} (id, email, first_name, last_name, password_enc) VALUES ($1, $2, $3, $4, $5)`
  const { id, email, firstname, lastname, password_enc } = parameters
  return datasource.query(query, [id, email, firstname, lastname, password_enc])
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
