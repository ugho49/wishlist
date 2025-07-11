import type { MigrationInterface, QueryRunner } from 'typeorm'

import { AttendeeRole, uuid } from '@wishlist/common'

export class ReplaceCreatorOfEventByAttendee1722894610304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`select id, creator_id from event`)
    for (const row of rows) {
      await queryRunner.query(
        `insert into event_attendee (id, event_id, user_id, role) values ('${uuid()}','${row.id}', '${row.creator_id}', '${AttendeeRole.MAINTAINER}')`,
      )
    }
    await queryRunner.query(`
      ALTER TABLE event
      DROP COLUMN creator_id
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE event
      ADD COLUMN creator_id UUID REFERENCES "user"(id)
    `)

    const rows = await queryRunner.query(
      `select event_id, user_id from event_attendee where role = '${AttendeeRole.MAINTAINER}'`,
    )
    for (const row of rows) {
      await queryRunner.query(`update event set creator_id = '${row.user_id}' where id = '${row.event_id}'`)
    }

    await queryRunner.query(`delete from event_attendee where role = '${AttendeeRole.MAINTAINER}'`)

    await queryRunner.query(`
      ALTER TABLE event
      ALTER COLUMN creator_id SET NOT NULL
    `)
  }
}
