import { Module } from '@nestjs/common'

import { EventModule } from '../../event/event.module'
import { handlers } from '../application'
import { AttendeeController } from './attendee.controller'

@Module({
  imports: [EventModule],
  controllers: [AttendeeController],
  providers: [...handlers],
})
export class AttendeeModule {}
