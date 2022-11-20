import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1661984005903 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    await runner.query(`
      CREATE TABLE "user"
      (
          id                  UUID,
          email               VARCHAR(200)   NOT NULL,
          first_name          VARCHAR(50)    NOT NULL,
          last_name           VARCHAR(50)    NOT NULL,
          birthday            DATE,
          password_enc        VARCHAR(500),
          account_locked      BOOLEAN        NOT NULL DEFAULT FALSE,
          account_expired     BOOLEAN        NOT NULL DEFAULT FALSE,
          credentials_expired BOOLEAN        NOT NULL DEFAULT FALSE,
          is_enabled          BOOLEAN        NOT NULL DEFAULT TRUE,
          authorities         VARCHAR(100)[] NOT NULL DEFAULT ARRAY ['ROLE_USER'],
          last_ip             VARCHAR(50),
          last_connected_at   TIMESTAMPTZ,
          created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
          updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id)
      );

      CREATE UNIQUE INDEX user_email_unique_idx on "user" (LOWER(email));
    `);

    await runner.query(`
      CREATE TABLE event
      (
          id          UUID,
          title       VARCHAR(100) NOT NULL,
          description TEXT,
          event_date  DATE         NOT NULL,
          creator_id  UUID         NOT NULL,
          created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (creator_id) REFERENCES "user" (id)
      )
    `);

    await runner.query(`
      CREATE TABLE wishlist
      (
          id          UUID,
          title       VARCHAR(100) NOT NULL,
          description TEXT,
          owner_id    UUID         NOT NULL,
          hide_items  BOOLEAN      NOT NULL DEFAULT true,
          created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (owner_id) REFERENCES "user" (id) ON DELETE CASCADE
      )
    `);

    await runner.query(`
      CREATE TABLE item
      (
          id           UUID,
          name         VARCHAR(100) NOT NULL,
          description  TEXT,
          url          VARCHAR(1000),
          is_suggested BOOLEAN      NOT NULL DEFAULT FALSE,
          score        INTEGER,
          wishlist_id  UUID         NOT NULL,
          taker_id     UUID,
          taken_at     TIMESTAMPTZ,
          created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (wishlist_id) REFERENCES wishlist (id) ON DELETE CASCADE,
          FOREIGN KEY (taker_id) REFERENCES "user" (id) ON DELETE SET NULL
      )
    `);

    await runner.query(`
      CREATE TABLE event_wishlist
      (
          event_id    UUID NOT NULL,
          wishlist_id UUID NOT NULL,
          PRIMARY KEY (event_id, wishlist_id),
          FOREIGN KEY (wishlist_id) REFERENCES wishlist (id) ON DELETE CASCADE,
          FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE
      )
    `);

    await runner.query(`
      CREATE TABLE event_attendee
      (
          id              UUID,
          event_id        UUID        NOT NULL,
          user_id         UUID,
          temp_user_email VARCHAR(200),
          role            VARCHAR(50) NOT NULL DEFAULT 'user',
          PRIMARY KEY (id),
          UNIQUE (event_id, user_id, temp_user_email),
          FOREIGN KEY (event_id) REFERENCES event (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
          CONSTRAINT chk_user CHECK ((user_id IS NOT NULL AND temp_user_email IS NULL) or (user_id IS NULL AND temp_user_email IS NOT NULL))
      )
    `);

    await runner.query(`
      CREATE TABLE user_password_verification
      (
          id         UUID,
          user_id    UUID         NOT NULL,
          token      VARCHAR(200) NOT NULL,
          expired_at TIMESTAMPTZ  NOT NULL,
          created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
      )
    `);

    await runner.query(`
      CREATE TABLE user_email_setting
      (
          id                          UUID,
          user_id                     UUID        NOT NULL,
          daily_new_item_notification BOOLEAN     NOT NULL DEFAULT TRUE,
          created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
          UNIQUE (user_id)
      )
    `);
  }

  public async down(runner: QueryRunner): Promise<void> {
    await runner.dropTable('event_wishlist');
    await runner.dropTable('event_attendee');
    await runner.dropTable('item');
    await runner.dropTable('event');
    await runner.dropTable('wishlist');
    await runner.dropTable('user_password_verification');
    await runner.dropTable('user_email_setting');
    await runner.dropTable('"user"');
  }
}
