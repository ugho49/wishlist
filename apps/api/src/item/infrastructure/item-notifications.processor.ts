import { Injectable, Logger } from '@nestjs/common';

import { QueueProcessor } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyNewItemsUseCase } from '../application/command/notify-new-items.use-case';

@Injectable()
export class ItemNotificationsProcessor extends QueueProcessor(QueueName.ITEMS_NOTIFICATIONS) {
  private readonly logger = new Logger(ItemNotificationsProcessor.name);

  constructor(private readonly notifyNewItemsUseCase: NotifyNewItemsUseCase) {
    super({ concurrency: 1, repeat: { pattern: '15 10 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.log('Processing item notifications job ...');
    await this.notifyNewItemsUseCase.execute();
  }
}
