import { Injectable } from '@nestjs/common'

import { BucketService } from './bucket.service'

@Injectable()
export class BucketMockService extends BucketService {
  constructor() {
    super('mock')
  }

  removeIfExist(param: { destination: string }): Promise<void> {
    this.logger.log({ destination: param.destination }, 'Remove file')
    return Promise.resolve()
  }

  upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    this.logger.log({ destination: param.destination }, 'Upload file')
    return Promise.resolve(param.destination)
  }

  uploadFile(param: { destination: string; file: Express.Multer.File }): Promise<string> {
    this.logger.log({ destination: param.destination }, 'Upload file')
    return Promise.resolve(param.destination)
  }
}
