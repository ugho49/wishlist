import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity';
import { SecretSantaService } from './secret-santa.service';
import { SecretSantaMailer } from './secret-santa.mailer';
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository';
import { SecretSantaController } from './secret-santa.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaService, SecretSantaRepository, SecretSantaUserRepository, SecretSantaMailer],
})
export class SecretSantaModule {}
