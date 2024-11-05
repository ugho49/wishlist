import { Inject, Injectable } from '@nestjs/common'
import { Database, DATABASE } from '@wishlist/common-database'
import { EventId, UserId } from '@wishlist/domain'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'

@Injectable()
export class SecretSantaRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}
}

@Injectable()
export class SecretSantaUserRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getSecretSantaForEventAndUser(eventId: EventId, userId: UserId) {
    const entity = await this.db
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
      .where('secret_santa.event_id', '=', eventId)
      .executeTakeFirst()
  }
}
