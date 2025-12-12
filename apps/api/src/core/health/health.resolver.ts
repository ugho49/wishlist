import { Query, Resolver } from '@nestjs/graphql'
import { Public } from '@wishlist/api/auth'

import { HealthDto, HealthStatus } from './health.dto'
import { HealthService } from './health.service'

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Query(() => HealthDto, { description: 'Health check query' })
  async health(): Promise<HealthDto> {
    const health = await this.healthService.check()

    return {
      status: health.status as HealthStatus,
    }
  }
}
