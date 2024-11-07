import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { SecretSantaController } from './secret-santa.controller'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'
import { SecretSantaMailer } from './secret-santa.mailer'
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository'
import { SecretSantaService } from './secret-santa.service'
import { CreateSecretSantaUseCase } from './use-cases/create-secret-santa'
import { GetSecretSantaUseCase } from './use-cases/get-secret-santa'
import { GetSecretSantaDrawUseCase } from './use-cases/get-secret-santa-draw'

const useCases = [GetSecretSantaUseCase, GetSecretSantaDrawUseCase, CreateSecretSantaUseCase]

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaService, SecretSantaRepository, SecretSantaUserRepository, SecretSantaMailer, ...useCases],
})
export class SecretSantaModule {}
