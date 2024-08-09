import { Module } from '@nestjs/common'

import { ConfigurableMailModule } from './mail.module-definitions.js'
import { MailService } from './mail.service.js'

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule extends ConfigurableMailModule {}
