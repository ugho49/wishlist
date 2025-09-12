import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { SecretSantaAdminController } from './controllers/secret-santa-admin.controller'
import { SecretSantaController } from './controllers/secret-santa.controller'

@Module({
  controllers: [SecretSantaController, SecretSantaAdminController],
  providers: [...handlers],
})
export class SecretSantaModule {}
