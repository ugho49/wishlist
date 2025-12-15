import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { EventController } from './controllers/event.controller'
import { EventAdminController } from './controllers/event-admin.controller'
import { EventAttendeeController } from './controllers/event-attendee.controller'
import { EventAttendeeAdminController } from './controllers/event-attendee-admin.controller'
import { EventDataLoaderFactory } from './event.dataloader'
import { EventResolver } from './event.resolver'
import { EventAttendeeDataLoaderFactory } from './event-attendee.dataloader'
import { EventAttendeeResolver } from './event-attendee.resolver'

@Module({
  controllers: [EventController, EventAttendeeController, EventAdminController, EventAttendeeAdminController],
  providers: [
    ...handlers,
    EventDataLoaderFactory,
    EventAttendeeDataLoaderFactory,
    EventResolver,
    EventAttendeeResolver,
  ],
  exports: [EventDataLoaderFactory, EventAttendeeDataLoaderFactory],
})
export class EventModule {}
