import { Module } from '@nestjs/common'

import { EventMailer, LegacyEventService } from './infrastructure'
import { EventAdminController } from './infrastructure/event-admin.controller'
import { EventController } from './infrastructure/event.controller'

@Module({
  controllers: [EventController, EventAdminController],
  providers: [LegacyEventService, EventMailer],
  exports: [EventMailer],
})
export class EventModule {}
