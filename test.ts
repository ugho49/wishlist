import { Kysely, PostgresDialect } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Pool } from 'pg'

import { DatabaseSchema } from './libs/common-database/src/database.schema'

const dialect = new PostgresDialect({
  pool: new Pool({
    database: 'wishlist-api',
    host: 'localhost',
    user: 'service',
    password: 'service',
    port: 5432,
    max: 10,
  }),
})

const db = new Kysely<DatabaseSchema>({
  dialect,
  log: event => {
    if (event.level === 'query') {
      console.log(event.query.sql)
      console.log(event.query.parameters)
    }
  },
})

;(async function () {
  const entity = await db
    .selectFrom('secret_santa')
    .selectAll()
    .select(eb => [
      jsonArrayFrom(
        eb
          .selectFrom('secret_santa_user')
          .selectAll('secret_santa_user')
          .select(eb1 => [
            jsonObjectFrom(
              eb1
                .selectFrom('event_attendee')
                .selectAll('event_attendee')
                .select(eb2 => [
                  jsonObjectFrom(
                    eb2.selectFrom('user').selectAll('user').whereRef('event_attendee.user_id', '=', 'user.id'),
                  ).as('user'),
                ])
                .whereRef('secret_santa_user.attendee_id', '=', 'event_attendee.id'),
            ).as('attendee'),
          ])
          .whereRef('secret_santa.id', '=', 'secret_santa_user.secret_santa_id'),
      ).as('users'),
      jsonObjectFrom(eb.selectFrom('event').selectAll('event').whereRef('secret_santa.event_id', '=', 'event.id')).as(
        'event',
      ),
    ])
    .executeTakeFirst()

  console.dir(entity, { depth: null })

  await db.destroy()
})()
