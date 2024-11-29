import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserAccount1725483239583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_account
      (
          id                    UUID,
          user_id               UUID            NOT NULL,
          email                 VARCHAR(200)    NOT NULL,
          provider_type         VARCHAR(50)     NOT NULL,
          provider_data         VARCHAR(1000)   NOT NULL,
          picture_url           VARCHAR(1000),
          created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
          updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
          UNIQUE (user_id, provider_type)
      );

      CREATE UNIQUE INDEX user_account_provider_type_email_unique_idx on user_account (provider_type, LOWER(email));
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_account')
  }
}
