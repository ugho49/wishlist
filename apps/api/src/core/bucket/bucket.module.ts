import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import bucketConfig from './bucket.config'
import { BucketService } from './bucket.service'

@Module({
  imports: [ConfigModule.forFeature(bucketConfig)],
  providers: [BucketService],
  exports: [BucketService],
})
export class BucketModule {}
