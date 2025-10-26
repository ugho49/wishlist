import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { QueueName } from '../queue'
import { ConfigurableMailModule } from './mail.module-definitions'
import { MailProcessor } from './mail.processor'
import { MailService } from './mail.service'

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QueueName.MAILS })],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule extends ConfigurableMailModule {}
