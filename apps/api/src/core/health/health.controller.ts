import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from '../../domain/auth';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly dbHealthIndicator: TypeOrmHealthIndicator
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([async () => this.dbHealthIndicator.pingCheck('database', { timeout: 300 })]);
  }
}
