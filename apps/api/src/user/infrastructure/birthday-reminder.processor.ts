import { Injectable } from '@znight/core';
import { getLogger } from '@znight/observability';

import { QueueProcessorBase } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyUpcomingBirthdaysUseCase } from '../application/command/notify-upcoming-birthdays.use-case';

@Injectable()
export class BirthdayReminderProcessor extends QueueProcessorBase {
  readonly queueName = QueueName.BIRTHDAY_REMINDERS;

  private readonly logger = getLogger(BirthdayReminderProcessor.name);

  constructor(private readonly notifyUpcomingBirthdaysUseCase: NotifyUpcomingBirthdaysUseCase) {
    super({ concurrency: 1, repeat: { pattern: '0 9 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.info('Processing birthday reminder job ...');
    await this.notifyUpcomingBirthdaysUseCase.execute();
  }
}
