import { Factory, Provides } from '@znight/core';
import { getLogger } from '@znight/observability';

import { BucketConfig } from './bucket.config';
import { BucketMockService } from './bucket.mock.service';
import { BucketRealService } from './bucket.real.service';
import { BucketService } from './bucket.service';

@Factory()
export class BucketFactory {
  private readonly logger = getLogger(BucketFactory.name);

  @Provides()
  bucketService(config: BucketConfig): BucketService {
    const type = config.isMock ? 'mock' : 'real';

    this.logger.info(`Using ${type} implementation`);

    return config.isMock ? new BucketMockService() : new BucketRealService(config);
  }
}
