import type { MigrationInterface, QueryRunner } from 'typeorm'

import { Table } from 'typeorm'

export class AddSecretSanta1722950220717 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    await runner.createTable(
      new Table({
        name: 'secret_santa',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'event_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'budget',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar(20)',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['event_id'],
            referencedTableName: 'event',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        uniques: [{ columnNames: ['event_id'] }],
      }),
    )

    await runner.createTable(
      new Table({
        name: 'secret_santa_user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'secret_santa_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'attendee_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'draw_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'exclusions',
            type: 'uuid[]',
            isNullable: false,
            default: 'ARRAY[]::uuid[]',
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'NOW()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['secret_santa_id'],
            referencedTableName: 'secret_santa',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['draw_user_id'],
            referencedTableName: 'secret_santa_user',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['attendee_id'],
            referencedTableName: 'event_attendee',
            referencedColumnNames: ['id'],
          },
        ],
        uniques: [{ columnNames: ['secret_santa_id', 'attendee_id'] }],
      }),
    )
  }

  public async down(runner: QueryRunner): Promise<void> {
    await runner.dropTable(new Table({ name: 'secret_santa_user' }))
    await runner.dropTable(new Table({ name: 'secret_santa' }))
  }
}
