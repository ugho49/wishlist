import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';

import queueConfig from './queue.config';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(queueConfig), DiscoveryModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
