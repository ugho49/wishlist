import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  // controllers: [EventController, EventAdminController],
  // providers: [EventService, EventRepository, EventMailer],
  // exports: [EventRepository, EventMailer],
})
export class SecretSantaModule {}
