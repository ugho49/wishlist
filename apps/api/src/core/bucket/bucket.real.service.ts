import { Inject, Injectable } from '@nestjs/common'
import { uuid } from '@wishlist/common'
import { cert, initializeApp } from 'firebase-admin/app'
import { getStorage, Storage } from 'firebase-admin/storage'

import { BucketConfig } from './bucket.config'
import { BUCKET_CONFIG_TOKEN } from './bucket.module-definitions'
import { BucketService } from './bucket.service'

@Injectable()
export class BucketRealService extends BucketService {
  private storage: Storage

  constructor(@Inject(BUCKET_CONFIG_TOKEN) config: BucketConfig) {
    super('real')
    this.logger.log('Initializing firebase app ...', { certPath: config.firebaseServiceAccountKeyPath })

    const app = initializeApp({
      credential: cert(config.firebaseServiceAccountKeyPath),
      storageBucket: config.bucketName,
    })
    this.storage = getStorage(app)
  }

  async removeIfExist(param: { destination: string }): Promise<void> {
    await this.storage.bucket().deleteFiles({
      prefix: param.destination,
    })
  }

  async upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    try {
      const file = this.storage.bucket().file(param.destination)
      await file.save(param.data, { contentType: param.contentType, public: true })
      return file.publicUrl()
    } catch (e) {
      this.logger.error('Fail to upload file', { destination: param.destination })
      throw e
    }
  }

  uploadFile(param: { destination: string; file: Express.Multer.File }): Promise<string> {
    return this.upload({
      destination: `${param.destination}/${uuid()}`,
      data: param.file.buffer,
      contentType: param.file.mimetype,
    })
  }
}
