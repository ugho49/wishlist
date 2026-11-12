import { getLogger } from '@znight/observability';

import { BucketService } from './bucket.service';

export class BucketMockService extends BucketService {
  private readonly logger = getLogger(BucketMockService.name);

  removeIfExist(param: { destination: string }): Promise<void> {
    this.logger.info({ destination: param.destination }, 'Remove file');
    return Promise.resolve();
  }

  upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    this.logger.info({ destination: param.destination }, 'Upload file');
    return Promise.resolve(param.destination);
  }

  uploadFile(param: { destination: string; file: File }): Promise<string> {
    this.logger.info({ destination: param.destination }, 'Upload file');
    return Promise.resolve(param.destination);
  }
}
