import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EventModule } from '../event/event.module'
import { SecretSantaController } from './secret-santa.controller'
import { SecretSantaEntity, SecretSantaUserEntity } from './secret-santa.entity'
import { LegacySecretSantaRepository, LegacySecretSantaUserRepository } from './secret-santa.legacy-repository'
import { SecretSantaMailer } from './secret-santa.mailer'
import { SecretSantaService } from './secret-santa.service'

@Module({
  imports: [EventModule, TypeOrmModule.forFeature([SecretSantaEntity, SecretSantaUserEntity])],
  controllers: [SecretSantaController],
  providers: [SecretSantaService, LegacySecretSantaRepository, LegacySecretSantaUserRepository, SecretSantaMailer],
})
export class SecretSantaModule {}
