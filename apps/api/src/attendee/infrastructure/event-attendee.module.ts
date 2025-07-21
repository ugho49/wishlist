import { Module } from '@nestjs/common'
import { EventModule } from '@wishlist/api/event'

import { handlers } from '../application'
import { EventAttendeeController } from './event-attendee.controller'

@Module({
  imports: [EventModule],
  controllers: [EventAttendeeController],
  providers: [...handlers],
})
export class EventAttendeeModule {}
