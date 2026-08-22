import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { Queue } from 'bullmq';

import queueConfig from './queue.config';
import { QueueService } from './queue.service';
import { QUEUES, QueueName } from './queues.type';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(queueConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule.forFeature(queueConfig)],
      inject: [queueConfig.KEY],
      useFactory: (config: ConfigType<typeof queueConfig>) => ({
        prefix: 'bull',
        connection: {
          host: config.valkey.host,
          port: config.valkey.port,
          password: config.valkey.password,
          db: config.valkey.db,
        },
      }),
    }),
    ...Object.values(QueueName).map(name => BullModule.registerQueue({ name })),
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
export class QueueModule {}
