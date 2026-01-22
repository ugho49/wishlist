import { Injectable } from '@nestjs/common'
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus'

import { DatabaseHealthIndicator } from './database.indicator'

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealthIndicator: DatabaseHealthIndicator,
  ) {}

  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.databaseHealthIndicator.pingCheck('database')])
  }
}
