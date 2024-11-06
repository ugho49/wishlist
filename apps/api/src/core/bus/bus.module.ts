import type { QueryHandlerRegistry } from './registry/query.registry'

import { Global, Logger, Module } from '@nestjs/common'
import { createQueryBus, QueryBus as MissiveQueryBus } from 'missive.js'

export const QUERY_BUS = Symbol('QUERY_BUS')
export type QueryBus = MissiveQueryBus<QueryHandlerRegistry>

// const COMMAND_BUS = Symbol('COMMAND_BUS')

@Global()
@Module({
  providers: [
    {
      provide: QUERY_BUS,
      useFactory: () => {
        const logger = new Logger('QueryBus')
        const bus = createQueryBus<QueryHandlerRegistry>()
        bus.useLoggerMiddleware({ logger })
        return bus
      },
    },
    // {
    //   provide: COMMAND_BUS,
    //   useFactory: () => {
    //     const logger = new Logger('CommandBus')
    //     const bus = createCommandBus<{}>()
    //     bus.useLoggerMiddleware({ logger })
    //     return bus
    //   },
    // },
  ],
  exports: [
    QUERY_BUS,
    // COMMAND_BUS
  ],
})
export class BusModule {}
