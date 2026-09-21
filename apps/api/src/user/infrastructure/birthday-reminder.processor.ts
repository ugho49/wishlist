import { Injectable, Logger } from '@nestjs/common';

import { QueueProcessor } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyUpcomingBirthdaysUseCase } from '../application/command/notify-upcoming-birthdays.use-case';

@Injectable()
export class BirthdayReminderProcessor extends QueueProcessor(QueueName.BIRTHDAY_REMINDERS) {
  private readonly logger = new Logger(BirthdayReminderProcessor.name);

  constructor(private readonly notifyUpcomingBirthdaysUseCase: NotifyUpcomingBirthdaysUseCase) {
    super({ concurrency: 1, repeat: { pattern: '0 9 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.log('Processing birthday reminder job ...');
    await this.notifyUpcomingBirthdaysUseCase.execute();
  }
}
