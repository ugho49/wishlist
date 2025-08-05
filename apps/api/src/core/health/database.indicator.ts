import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus'
import { DatabaseService } from '@wishlist/api/core'

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly databaseService: DatabaseService,
  ) {}

  async pingCheck<Key extends string = string>(key: Key): Promise<HealthIndicatorResult<Key>> {
    try {
      await this.databaseService.db.execute('SELECT 1')
      return this.healthIndicatorService.check(key).up()
    } catch {
      return this.healthIndicatorService.check(key).down()
    }
  }
}
