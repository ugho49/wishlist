import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { EventRemindersProcessor } from './event-reminders.processor';
import { NotificationResolver } from './resolvers/notification.resolver';

@Module({
  providers: [...handlers, NotificationResolver, EventRemindersProcessor],
})
export class NotificationModule {}
