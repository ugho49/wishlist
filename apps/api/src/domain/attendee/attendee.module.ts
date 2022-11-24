import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeEntity } from './attendee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeEntity])],
})
export class AttendeeModule {}
