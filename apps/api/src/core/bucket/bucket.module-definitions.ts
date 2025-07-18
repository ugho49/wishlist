import type { BucketConfig } from './bucket.config'

import { ConfigurableModuleBuilder } from '@nestjs/common'

export const { ConfigurableModuleClass: ConfigurableBucketModule, MODULE_OPTIONS_TOKEN: BUCKET_CONFIG_TOKEN } =
  new ConfigurableModuleBuilder<BucketConfig>().build()
