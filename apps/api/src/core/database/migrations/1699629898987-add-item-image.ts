import type { MigrationInterface, QueryRunner } from 'typeorm'

import { TableColumn } from 'typeorm'

export class addItemImage1699629898987 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    await runner.addColumn('item', new TableColumn({ name: 'picture_url', type: 'varchar(1000)', isNullable: true }))
  }

  public async down(runner: QueryRunner): Promise<void> {
    await runner.dropColumn('item', 'picture_url')
  }
}
