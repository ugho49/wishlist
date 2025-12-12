import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheck } from '@nestjs/terminus'

import { Public } from '../../auth/infrastructure/decorators/public.metadata'
import { HealthService } from './health.service'

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.healthService.check()
  }
}
