import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { EventAdminController } from './event-admin.controller'
import { EventController } from './event.controller'
import { EventMailer } from './event.mailer'

@Module({
  controllers: [EventController, EventAdminController],
  providers: [EventMailer, ...handlers],
  exports: [EventMailer],
})
export class EventModule {}
