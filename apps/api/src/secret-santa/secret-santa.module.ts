import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { handlers } from './application/handler'
import { SecretSantaController } from './infrastructure/secret-santa.controller'
import { SecretSantaEntity, SecretSantaUserEntity } from './infrastructure/secret-santa.entity'
import { SecretSantaRepository, SecretSantaUserRepository } from './infrastructure/secret-santa.repository'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaRepository, SecretSantaUserRepository, ...handlers],
})
export class SecretSantaModule {}
