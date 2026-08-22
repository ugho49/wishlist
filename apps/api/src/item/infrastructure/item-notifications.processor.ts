import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';

import { WithPinoContext } from '../../core/queue/decorators/with-pino-context.decorator';
import { QueueName } from '../../core/queue/queues.type';
import { NotifyNewItemsUseCase } from '../application/command/notify-new-items.use-case';
import { ItemNotificationJobName } from './item.type';

@Processor(QueueName.ITEMS_NOTIFICATIONS, { concurrency: 1 })
export class ItemNotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ItemNotificationsProcessor.name);

  constructor(
    private readonly notifyNewItemsUseCase: NotifyNewItemsUseCase,
    @InjectPinoLogger(ItemNotificationsProcessor.name)
    private readonly pinoLogger: PinoLogger,
  ) {
    super();
  }

  @WithPinoContext()
  async process(job: Job<void>): Promise<void> {
    this.pinoLogger.assign({ job: { id: job.id, name: job.name, queueName: job.queueName, data: job.data } });
    this.logger.log('Processing item notifications job ...');

    switch (job.name) {
      case ItemNotificationJobName.DAILY_NEW_ITEMS_NOTIFIER:
        await this.notifyNewItemsUseCase.execute();
        break;
      default:
        this.logger.error('Unknown job name ...');
        break;
    }
  }
}
