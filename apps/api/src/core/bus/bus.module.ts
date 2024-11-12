import { Global, Module } from '@nestjs/common'

import { BusService } from './bus.service'

@Global()
@Module({
  providers: [BusService],
  exports: [BusService],
})
export class BusModule {}
