import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { Public } from '@wishlist/api/auth'

import { DatabaseHealthIndicator } from './database.indicator'

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealthIndicator: DatabaseHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.databaseHealthIndicator.pingCheck('database')])
  }
}
