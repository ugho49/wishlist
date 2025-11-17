import { Inject, Injectable } from '@nestjs/common'

import { frontendRoutesBuilder } from './frontend-routes.builder'
import { FrontendRoutesConfig } from './frontend-routes.config'
import { FRONTEND_ROUTES_CONFIG_TOKEN } from './frontend-routes.module-definitions'

@Injectable()
export class FrontendRoutesService {
  constructor(@Inject(FRONTEND_ROUTES_CONFIG_TOKEN) public readonly config: FrontendRoutesConfig) {}

  get routes() {
    return frontendRoutesBuilder(this.config.baseUrl)
  }
}
