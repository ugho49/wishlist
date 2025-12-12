import { Query, Resolver } from '@nestjs/graphql'

import { Public } from '../../auth/infrastructure/decorators/public.metadata'
import { HealthOutput, HealthStatus } from './health.dto'
import { HealthService } from './health.service'

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Query(() => HealthOutput)
  async health(): Promise<HealthOutput> {
    const health = await this.healthService.check()

    return {
      status: health.status as HealthStatus,
    }
  }
}
