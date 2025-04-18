import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module'
import { EventAdminController } from './controllers/event-admin.controller'
import { EventController } from './controllers/event.controller'
import { EventEntity } from './event.entity'
import { EventMailer } from './event.mailer'
import { EventRepository } from './event.repository'
import { EventService } from './event.service'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), UserModule],
  controllers: [EventController, EventAdminController],
  providers: [EventService, EventRepository, EventMailer],
  exports: [EventRepository, EventMailer],
})
export class EventModule {}
