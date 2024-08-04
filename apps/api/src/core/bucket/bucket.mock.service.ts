import { Injectable } from '@nestjs/common'

import { BucketService } from './bucket.service'

@Injectable()
export class BucketMockService extends BucketService {
  constructor() {
    super('mock')
  }

  async removeIfExist(param: { destination: string }): Promise<void> {
    this.logger.log({ destination: param.destination }, 'Remove file')
  }

  async upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string> {
    this.logger.log({ destination: param.destination }, 'Upload file')
    return param.destination
  }
}
