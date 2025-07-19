import { Module } from '@nestjs/common'

import { handlers } from './application'
import { EventMailer } from './infrastructure'
import { EventAdminController } from './infrastructure/event-admin.controller'
import { EventController } from './infrastructure/event.controller'

@Module({
  controllers: [EventController, EventAdminController],
  providers: [EventMailer, ...handlers],
  exports: [EventMailer],
})
export class EventModule {}
