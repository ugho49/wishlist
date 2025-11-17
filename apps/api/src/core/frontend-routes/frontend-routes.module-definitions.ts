import type { FrontendRoutesConfig } from './frontend-routes.config'

import { ConfigurableModuleBuilder } from '@nestjs/common'

export const {
  ConfigurableModuleClass: ConfigurableFrontendRoutesModule,
  MODULE_OPTIONS_TOKEN: FRONTEND_ROUTES_CONFIG_TOKEN,
} = new ConfigurableModuleBuilder<FrontendRoutesConfig>().build()
