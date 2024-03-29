import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import bucketConfig from './bucket.config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';

@Injectable()
export class BucketService {
  private storage: Storage;
  private readonly logger = new Logger(BucketService.name);

  constructor(@Inject(bucketConfig.KEY) private readonly config: ConfigType<typeof bucketConfig>) {
    const app = initializeApp({
      credential: cert(config.firebaseServiceAccountKeyPath),
      storageBucket: config.bucketName,
    });
    this.storage = getStorage(app);
  }

  async removeIfExist(param: { destination: string }): Promise<void> {
    await this.storage.bucket().deleteFiles({
      prefix: param.destination,
    });
  }

  async upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    try {
      const file = this.storage.bucket().file(param.destination);
      await file.save(param.data, { contentType: param.contentType, public: true });
      return file.publicUrl();
    } catch (e) {
      this.logger.error('Fail to upload file', { destination: param.destination });
      throw e;
    }
  }
}
