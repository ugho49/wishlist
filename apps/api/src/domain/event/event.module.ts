import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { EventController } from './controllers/event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { UserModule } from '../user/user.module';
import { EventAdminController } from './controllers/event-admin.controller';
import { EventMailer } from './event.mailer';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity]), UserModule],
  controllers: [EventController, EventAdminController],
  providers: [EventService, EventRepository, EventMailer],
  exports: [EventRepository, EventMailer],
})
export class EventModule {}
