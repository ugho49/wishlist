import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module.js'
import { SecretSantaController } from './secret-santa.controller.js'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity.js'
import { SecretSantaMailer } from './secret-santa.mailer.js'
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository.js'
import { SecretSantaService } from './secret-santa.service.js'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaService, SecretSantaRepository, SecretSantaUserRepository, SecretSantaMailer],
})
export class SecretSantaModule {}
