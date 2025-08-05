import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { DatabaseHealthIndicator } from './database.indicator'
import { HealthController } from './health.controller'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}
