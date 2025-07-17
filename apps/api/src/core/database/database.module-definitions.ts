import type { DatabaseConfig } from './database.config'

import { ConfigurableModuleBuilder } from '@nestjs/common'

export const { ConfigurableModuleClass: ConfigurableDatabaseModule, MODULE_OPTIONS_TOKEN: DATABASE_CONFIG_TOKEN } =
  new ConfigurableModuleBuilder<DatabaseConfig>().build()
