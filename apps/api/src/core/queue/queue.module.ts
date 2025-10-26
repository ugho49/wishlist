import { BullModule } from '@nestjs/bullmq'
import { DynamicModule, Module } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import type { QueueModuleConfig } from './queue-module.config'
import { EventPublisherService } from './event-publisher.service'
import { EventsProcessor } from './events.processor'
import { EventHandlerRegistryService } from './event-handler-registry.service'

@Module({})
export class QueueModule {
  static registerAsync(options: {
    inject?: any[]
    useFactory: (...args: any[]) => QueueModuleConfig | Promise<QueueModuleConfig>
  }): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        DiscoveryModule,
        BullModule.forRootAsync({
          inject: options.inject,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args)
            return {
              connection: {
                host: config.host,
                port: config.port,
                password: config.password,
                username: config.username,
                db: config.db,
                keyPrefix: config.keyPrefix,
              },
            }
          },
        }),
        BullModule.registerQueue({
          name: 'events',
        }),
      ],
      providers: [EventPublisherService, EventsProcessor, EventHandlerRegistryService],
      exports: [BullModule, EventPublisherService, EventsProcessor],
    }
  }
}
