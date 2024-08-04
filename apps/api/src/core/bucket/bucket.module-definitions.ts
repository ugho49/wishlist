import { ConfigurableModuleBuilder } from '@nestjs/common'

import { BucketConfig } from './bucket.config'

export const { ConfigurableModuleClass: ConfigurableBucketModule, MODULE_OPTIONS_TOKEN: BUCKET_CONFIG_TOKEN } =
  new ConfigurableModuleBuilder<BucketConfig>()
    .setExtras({ isGlobal: false }, (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }))
    .build()
