import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { SecretSantaController } from './secret-santa.controller'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'
import { SecretSantaMailer } from './secret-santa.mailer'
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository'
import { SecretSantaService } from './secret-santa.service'
import { GetSecretSantaUseCase } from './use-cases/get-secret-santa'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [
    SecretSantaService,
    SecretSantaRepository,
    SecretSantaUserRepository,
    SecretSantaMailer,
    GetSecretSantaUseCase,
  ],
})
export class SecretSantaModule {}
