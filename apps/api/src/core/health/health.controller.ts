import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { Public } from '@wishlist/api/auth'

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    // TODO: add db health check
    return this.health.check([])
  }
}
