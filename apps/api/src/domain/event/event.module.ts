import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { AttendeeEntity } from './entities/attendee.entity';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, AttendeeEntity])],
  controllers: [EventController],
  providers: [EventService, EventRepository],
})
export class EventModule {}
