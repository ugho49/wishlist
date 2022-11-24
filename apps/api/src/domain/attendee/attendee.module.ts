import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeEntity } from './attendee.entity';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';
import { AttendeeRepository } from './attendee.repository';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttendeeEntity]), EventModule, UserModule],
  controllers: [AttendeeController],
  providers: [AttendeeService, AttendeeRepository],
})
export class AttendeeModule {}
