import { Logger } from '@nestjs/common'

export abstract class BucketService {
  protected readonly logger = new Logger(BucketService.name)

  protected constructor(type: 'mock' | 'real') {
    this.logger.log(`Using ${type} implementation`)
  }

  abstract removeIfExist(param: { destination: string }): Promise<void>
  abstract upload(param: { destination: string; data: Buffer; contentType: string }): Promise<string>
}
