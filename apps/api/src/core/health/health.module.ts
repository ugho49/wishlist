import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { DatabaseHealthIndicator } from './database.indicator'
import { HealthController } from './health.controller'
import { HealthResolver } from './health.resolver'
import { HealthService } from './health.service'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, HealthService, HealthResolver],
})
export class HealthModule {}
