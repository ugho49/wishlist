import { Global, Module } from '@nestjs/common'

import { ConfigurableFrontendRoutesModule } from './frontend-routes.module-definitions'
import { FrontendRoutesService } from './frontend-routes.service'

@Global()
@Module({
  providers: [FrontendRoutesService],
  exports: [FrontendRoutesService],
})
export class FrontendRoutesModule extends ConfigurableFrontendRoutesModule {}
