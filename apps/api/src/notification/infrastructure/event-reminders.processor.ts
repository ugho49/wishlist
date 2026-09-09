import { Injectable, Logger } from '@nestjs/common';

import { QueueProcessor } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyEventRemindersUseCase } from '../application/command/notify-event-reminders.use-case';

@Injectable()
export class EventRemindersProcessor extends QueueProcessor(QueueName.EVENT_REMINDERS) {
  private readonly logger = new Logger(EventRemindersProcessor.name);

  constructor(private readonly notifyEventRemindersUseCase: NotifyEventRemindersUseCase) {
    super({ concurrency: 1, repeat: { pattern: '45 10 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.log('Processing event reminders job ...');
    await this.notifyEventRemindersUseCase.execute();
  }
}
