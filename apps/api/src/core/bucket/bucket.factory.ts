import { Factory, Provides } from '@znight/core';

import { BucketConfig } from './bucket.config';
import { BucketMockService } from './bucket.mock.service';
import { BucketRealService } from './bucket.real.service';
import { BucketService } from './bucket.service';

@Factory()
export class BucketFactory {
  @Provides()
  bucketService(config: BucketConfig): BucketService {
    return config.isMock ? new BucketMockService() : new BucketRealService(config);
  }
}
