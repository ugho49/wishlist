import { Global, Module } from '@nestjs/common'

import { BusModule } from './bus/bus.module'

@Global()
@Module({
  imports: [BusModule],
})
export class CoreModule {}
