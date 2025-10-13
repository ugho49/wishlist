import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { EventController } from './controllers/event.controller'
import { EventAdminController } from './controllers/event-admin.controller'
import { EventAttendeeController } from './controllers/event-attendee.controller'
import { EventAttendeeAdminController } from './controllers/event-attendee-admin.controller'

@Module({
  controllers: [EventController, EventAttendeeController, EventAdminController, EventAttendeeAdminController],
  providers: [...handlers],
})
export class EventModule {}
