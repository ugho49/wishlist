import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { EventController } from './controllers/event.controller'
import { EventAdminController } from './controllers/event-admin.controller'
import { EventAttendeeController } from './controllers/event-attendee.controller'
import { EventAttendeeAdminController } from './controllers/event-attendee-admin.controller'
import { EventDataLoaderFactory } from './event.dataloader'
import { EventAttendeeDataLoaderFactory } from './event-attendee.dataloader'
import { EventFieldResolver } from './resolvers/event.field-resolver'
import { EventResolver } from './resolvers/event.resolver'
import { EventAdminResolver } from './resolvers/event-admin.resolver'
import { EventAttendeeFieldResolver } from './resolvers/event-attendee.field-resolver'
import { EventMutationResolver } from './resolvers/event-mutation.resolver'

@Module({
  controllers: [EventController, EventAttendeeController, EventAdminController, EventAttendeeAdminController],
  providers: [
    ...handlers,
    EventDataLoaderFactory,
    EventAttendeeDataLoaderFactory,
    EventResolver,
    EventMutationResolver,
    EventAdminResolver,
    EventFieldResolver,
    EventAttendeeFieldResolver,
  ],
  exports: [EventDataLoaderFactory, EventAttendeeDataLoaderFactory],
})
export class EventModule {}
