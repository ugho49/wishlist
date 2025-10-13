import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { SecretSantaController } from './controllers/secret-santa.controller'
import { SecretSantaAdminController } from './controllers/secret-santa-admin.controller'

@Module({
  controllers: [SecretSantaController, SecretSantaAdminController],
  providers: [...handlers],
})
export class SecretSantaModule {}
