import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { UserModule } from '../user/user.module'
import { AttendeeController } from './attendee.controller'
import { AttendeeEntity } from './attendee.entity'
import { AttendeeRepository } from './attendee.repository'
import { AttendeeService } from './attendee.service'

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeEntity]), EventModule, UserModule],
  controllers: [AttendeeController],
  providers: [AttendeeService, AttendeeRepository],
})
export class AttendeeModule {}
