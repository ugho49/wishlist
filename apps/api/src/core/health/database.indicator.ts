import { Injectable } from '@nestjs/common'
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus'

import { DatabaseService } from '../database/database.service'

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly databaseService: DatabaseService,
  ) {}

  async pingCheck<Key extends string = string>(key: Key): Promise<HealthIndicatorResult<Key>> {
    const indicator = this.healthIndicatorService.check(key)

    try {
      await this.databaseService.ping()
      return indicator.up()
    } catch {
      return indicator.down()
    }
  }
}
