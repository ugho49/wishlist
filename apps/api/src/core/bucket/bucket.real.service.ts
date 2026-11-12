import type { BucketConfig } from './bucket.config';

import { uuid } from '@wishlist/common';
import { cert, initializeApp } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';

import { BucketService } from './bucket.service';

export class BucketRealService extends BucketService {
  private readonly storage: Storage;

  constructor(config: BucketConfig) {
    super();
    this.logger.info('Initializing firebase app ...', { certPath: config.firebaseServiceAccountKeyPath });

    const app = initializeApp({
      credential: cert(config.firebaseServiceAccountKeyPath),
      storageBucket: config.bucketName,
    });
    this.storage = getStorage(app);
  }

  async removeIfExist(param: { destination: string }): Promise<void> {
    this.logger.info('Removing file...', { destination: param.destination });
    await this.storage.bucket().deleteFiles({
      prefix: param.destination,
    });
  }

  async upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    try {
      this.logger.info('Uploading file...', { destination: param.destination });
      const file = this.storage.bucket().file(param.destination);
      await file.save(param.data, { contentType: param.contentType, public: true });
      return file.publicUrl();
    } catch (e) {
      this.logger.error('Fail to upload file', { destination: param.destination });
      throw e;
    }
  }

  async uploadFile(param: { destination: string; file: File }): Promise<string> {
    return this.upload({
      destination: `${param.destination}/${uuid()}`,
      data: Buffer.from(await param.file.arrayBuffer()),
      contentType: param.file.type,
    });
  }
}
