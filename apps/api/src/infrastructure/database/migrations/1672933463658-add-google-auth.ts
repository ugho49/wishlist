import type { MigrationInterface, QueryRunner } from 'typeorm'

import { TableColumn } from 'typeorm'

export class addGoogleAuth1672933463658 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE user_social
      (
          id                    UUID,
          user_id               UUID        NOT NULL,
          social_id             VARCHAR(1000) NOT NULL,
          social_type           VARCHAR(50) NOT NULL,
          picture_url           VARCHAR(1000),
          created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
          UNIQUE (user_id, social_type),
          UNIQUE (social_id, social_type)
      )
    `)

    await runner.addColumn('user', new TableColumn({ name: 'picture_url', type: 'varchar(1000)', isNullable: true }))
  }

  public async down(runner: QueryRunner): Promise<void> {
    await runner.dropTable('user_social')
    await runner.dropColumn('user', 'picture_url')
  }
}
