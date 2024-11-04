import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { Database, DATABASE } from '@wishlist/common-database'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async onModuleDestroy() {
    await this.db.destroy()
  }
}
