import { Module } from '@nestjs/common'

import { EventModule } from '../event/event.module'
import { LegacyAttendeeService } from './infrastructure'
import { AttendeeController } from './infrastructure/attendee.controller'

@Module({
  imports: [EventModule],
  controllers: [AttendeeController],
  providers: [LegacyAttendeeService],
})
export class AttendeeModule {}
