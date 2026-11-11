import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { QueueProcessorBase } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyNewItemsUseCase } from '../application/command/notify-new-items.use-case';

@Injectable()
export class ItemNotificationsProcessor extends QueueProcessorBase {
  readonly queueName = QueueName.ITEMS_NOTIFICATIONS;

  private readonly logger = getLogger(ItemNotificationsProcessor.name);

  constructor(private readonly notifyNewItemsUseCase: NotifyNewItemsUseCase) {
    super({ concurrency: 1, repeat: { pattern: '15 10 * * *', tz: 'Europe/Paris' } });
  }

  async process(): Promise<void> {
    this.logger.info('Processing item notifications job ...');
    await this.notifyNewItemsUseCase.execute();
  }
}
