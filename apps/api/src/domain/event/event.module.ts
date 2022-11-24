import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { AttendeeEntity } from './entities/attendee.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, AttendeeEntity]), UserModule],
  controllers: [EventController],
  providers: [EventService, EventRepository],
  exports: [EventService, EventRepository],
})
export class EventModule {}
