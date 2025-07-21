import { Module } from '@nestjs/common'

import { handlers } from '../application'
import { SecretSantaController } from './secret-santa.controller'

@Module({
  controllers: [SecretSantaController],
  providers: [...handlers],
})
export class SecretSantaModule {}
