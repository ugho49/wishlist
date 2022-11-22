import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { AttendeeEntity } from './entities/attendee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, AttendeeEntity])],
})
export class EventModule {}
