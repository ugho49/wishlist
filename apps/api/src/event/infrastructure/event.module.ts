import { Module } from '@nestjs/common';

import { handlers } from '../application';
import { EventDataLoaderFactory } from './event.dataloader';
import { EventAttendeeDataLoaderFactory } from './event-attendee.dataloader';
import { EventFieldResolver } from './resolvers/event.field-resolver';
import { EventResolver } from './resolvers/event.resolver';
import { EventAdminResolver } from './resolvers/event-admin.resolver';
import { EventAttendeeFieldResolver } from './resolvers/event-attendee.field-resolver';
import { EventMutationResolver } from './resolvers/event-mutation.resolver';

@Module({
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
