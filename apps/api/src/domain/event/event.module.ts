import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserModule } from '../user/user.module.js'
import { EventAdminController } from './controllers/event-admin.controller.js'
import { EventController } from './controllers/event.controller.js'
import { EventEntity } from './event.entity.js'
import { EventMailer } from './event.mailer.js'
import { EventRepository } from './event.repository.js'
import { EventService } from './event.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), UserModule],
  controllers: [EventController, EventAdminController],
  providers: [EventService, EventRepository, EventMailer],
  exports: [EventRepository, EventMailer],
})
export class EventModule {}
