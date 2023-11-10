import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class addWishlistLogo1699627478472 implements MigrationInterface {
  public async up(runner: QueryRunner): Promise<void> {
    await runner.addColumn('wishlist', new TableColumn({ name: 'logo_url', type: 'varchar(1000)', isNullable: true }));
  }

  public async down(runner: QueryRunner): Promise<void> {
    await runner.dropColumn('wishlist', 'logo_url');
  }
}
