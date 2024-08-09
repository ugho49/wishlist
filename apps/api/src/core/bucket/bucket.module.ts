import { Module } from '@nestjs/common'

import { BucketConfig } from './bucket.config.js'
import { BucketMockService } from './bucket.mock.service.js'
import { BUCKET_CONFIG_TOKEN, ConfigurableBucketModule } from './bucket.module-definitions.js'
import { BucketRealService } from './bucket.real.service.js'
import { BucketService } from './bucket.service.js'

@Module({
  providers: [
    {
      provide: BucketService,
      inject: [BUCKET_CONFIG_TOKEN],
      useFactory: (bucketConfig: BucketConfig) => {
        if (bucketConfig.isMock) {
          return new BucketMockService()
        }
        return new BucketRealService(bucketConfig)
      },
    },
  ],
  exports: [BucketService],
})
export class BucketModule extends ConfigurableBucketModule {}
