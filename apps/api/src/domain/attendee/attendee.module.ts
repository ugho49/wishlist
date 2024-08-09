import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module.js'
import { UserModule } from '../user/user.module.js'
import { AttendeeController } from './attendee.controller.js'
import { AttendeeEntity } from './attendee.entity.js'
import { AttendeeRepository } from './attendee.repository.js'
import { AttendeeService } from './attendee.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeEntity]), EventModule, UserModule],
  controllers: [AttendeeController],
  providers: [AttendeeService, AttendeeRepository],
})
export class AttendeeModule {}
