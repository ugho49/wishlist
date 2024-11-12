import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { SecretSantaController } from './secret-santa.controller'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'
import { SecretSantaRepository, SecretSantaUserRepository } from './secret-santa.repository'
import { AddSecretSantaUserUseCase } from './use-cases/add-secret-santa-user'
import { CancelSecretSantaUseCase } from './use-cases/cancel-secret-santa'
import { CreateSecretSantaUseCase } from './use-cases/create-secret-santa'
import { DeleteSecretSantaUseCase } from './use-cases/delete-secret-santa'
import { DeleteSecretSantaUserUseCase } from './use-cases/delete-secret-santa-user'
import { GetSecretSantaUseCase } from './use-cases/get-secret-santa'
import { GetSecretSantaDrawUseCase } from './use-cases/get-secret-santa-draw'
import { StartSecretSantaUseCase } from './use-cases/start-secret-santa'
import { UpdateSecretSantaUseCase } from './use-cases/update-secret-santa'
import { UpdateSecretSantaUserUseCase } from './use-cases/update-secret-santa-user'

const useCases = [
  GetSecretSantaUseCase,
  GetSecretSantaDrawUseCase,
  CreateSecretSantaUseCase,
  UpdateSecretSantaUseCase,
  DeleteSecretSantaUseCase,
  StartSecretSantaUseCase,
  CancelSecretSantaUseCase,
  AddSecretSantaUserUseCase,
  UpdateSecretSantaUserUseCase,
  DeleteSecretSantaUserUseCase,
]

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaRepository, SecretSantaUserRepository, ...useCases],
})
export class SecretSantaModule {}
