import { Module } from '@nestjs/common'

import { EventModule } from '../../event/event.module'
import { handlers } from '../application'
import { SecretSantaController } from './secret-santa.controller'

@Module({
  imports: [EventModule],
  controllers: [SecretSantaController],
  providers: [...handlers],
})
export class SecretSantaModule {}
