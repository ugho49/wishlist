import { Query, Resolver } from '@nestjs/graphql'
import { match } from 'ts-pattern'

import { Public } from '../../auth/infrastructure/decorators/public.metadata'
import { HealthResult, HealthStatus } from '../../gql/generated-types'
import { HealthService } from './health.service'

@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Query()
  async health(): Promise<HealthResult> {
    const health = await this.healthService.check()
    const status = match(health.status)
      .with('error', () => HealthStatus.Error)
      .with('ok', () => HealthStatus.Ok)
      .with('shutting_down', () => HealthStatus.ShuttingDown)
      .exhaustive()

    return { __typename: 'HealthResult', status }
  }
}
