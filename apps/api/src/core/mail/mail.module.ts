import { Module } from '@nestjs/common'

import { ConfigurableMailModule } from './mail.module-definitions'
import { MailService } from './mail.service'

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule extends ConfigurableMailModule {}
