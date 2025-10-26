import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { BullBoardAuthMiddleware } from './middleware/bull-board-auth.middleware'
import { QueueName } from './queues.type'

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        prefix: config.get<string>('VALKEY_KEY_PREFIX', 'wishlist:'),
        connection: {
          host: config.get<string>('VALKEY_HOST', 'localhost'),
          port: parseInt(config.get<string>('VALKEY_PORT', '6379'), 10),
          password: config.get<string>('VALKEY_PASSWORD', ''),
          db: parseInt(config.get<string>('VALKEY_DB', '0'), 10),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      boardOptions: {
        uiConfig: { boardTitle: 'Wishlist App' },
      },
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      ...Object.values(QueueName).map(name => ({
        name,
        adapter: BullMQAdapter,
      })),
    ),
  ],
})
export class QueueModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BullBoardAuthMiddleware).forRoutes('/queues')
  }
}
