import { Module } from '@nestjs/common'

import { EventModule } from '../event/event.module'
import { handlers } from './application/handler'
import { SecretSantaController } from './infrastructure/secret-santa.controller'

@Module({
  imports: [EventModule],
  controllers: [SecretSantaController],
  providers: [...handlers],
})
export class SecretSantaModule {}
