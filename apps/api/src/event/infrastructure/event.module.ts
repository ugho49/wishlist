import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { EventAdminController } from './controllers/event-admin.controller'
import { EventAttendeeController } from './controllers/event-attendee.controller'
import { EventController } from './controllers/event.controller'
import { EventMailer } from './event.mailer'

@Module({
  controllers: [EventController, EventAttendeeController, EventAdminController],
  providers: [EventMailer, ...handlers],
})
export class EventModule {}
