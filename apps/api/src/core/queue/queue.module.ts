import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { BullBoardModule } from '@bull-board/nestjs'
import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { Queue } from 'bullmq'

import { BullBoardAuthMiddleware } from './middleware/bull-board-auth.middleware'
import queueConfig from './queue.config'
import { QueueService } from './queue.service'
import { QUEUES, QueueName } from './queues.type'

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(queueConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      inject: [queueConfig.KEY],
      useFactory: (config: ConfigType<typeof queueConfig>) => ({
        prefix: config.valkey.keyPrefix,
        connection: {
          host: config.valkey.host,
          port: config.valkey.port,
          password: config.valkey.password,
          db: config.valkey.db,
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
    ...Object.values(QueueName).map(name => BullModule.registerQueue({ name })),
    BullBoardModule.forFeature(
      ...Object.values(QueueName).map(name => ({
        name,
        adapter: BullMQAdapter,
      })),
    ),
  ],
  providers: [
    QueueService,
    {
      provide: QUEUES,
      inject: Object.values(QueueName).map(name => getQueueToken(name)),
      useFactory: (...queues: Queue[]) => queues,
    },
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BullBoardAuthMiddleware).forRoutes('/queues')
  }
}
