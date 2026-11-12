import { Controller, Get, HttpResponse } from '@znight/http';
import { ApiTags } from '@znight/openapi';

import { Public } from '../../auth/infrastructure/decorators/public.metadata';
import { type HealthCheckResult, HealthService } from './health.service';

@ApiTags('Health')
@Controller('/health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HttpResponse<HealthCheckResult>> {
    const result = await this.healthService.check();
    return new HttpResponse(result, { status: result.status === 'ok' ? 200 : 503 });
  }
}
