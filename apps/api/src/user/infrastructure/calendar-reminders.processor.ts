import { Injectable, Logger } from '@nestjs/common';

import { QueueProcessor } from '../../core/queue/queue.type';
import { QueueName } from '../../core/queue/queues.definitions';
import { NotifyCalendarRemindersUseCase } from '../application/command/notify-calendar-reminders.use-case';

@Injectable()
export class CalendarRemindersProcessor extends QueueProcessor(QueueName.CALENDAR_REMINDERS) {
  private readonly logger = new Logger(CalendarRemindersProcessor.name);

  constructor(private readonly notifyCalendarRemindersUseCase: NotifyCalendarRemindersUseCase) {
    super({ concurrency: 1, repeat: { pattern: '30 10 * * *' } });
  }

  async process(): Promise<void> {
    this.logger.log('Processing calendar reminders job ...');
    await this.notifyCalendarRemindersUseCase.execute();
  }
}
