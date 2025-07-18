import { Module } from '@nestjs/common'

import { handlers } from './application'
import { EventMailer, LegacyEventService } from './infrastructure'
import { EventAdminController } from './infrastructure/event-admin.controller'
import { EventController } from './infrastructure/event.controller'

@Module({
  controllers: [EventController, EventAdminController],
  providers: [LegacyEventService, EventMailer, ...handlers],
  exports: [EventMailer],
})
export class EventModule {}
