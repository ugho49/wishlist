import { Global, Module } from '@nestjs/common'

import { BucketConfig } from './bucket.config'
import { BucketMockService } from './bucket.mock.service'
import { BUCKET_CONFIG_TOKEN, ConfigurableBucketModule } from './bucket.module-definitions'
import { BucketRealService } from './bucket.real.service'
import { BucketService } from './bucket.service'

@Global()
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
