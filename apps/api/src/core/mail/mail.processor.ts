import type * as SMTPTransport from 'nodemailer/lib/smtp-transport'

import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { render } from '@wishlist/mail'
import { Job } from 'bullmq'
import { createTransport, type Transporter } from 'nodemailer'
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs'

import { QueueName, WithPinoContext } from '../queue'
import { MailConfig } from './mail.config'
import { mapPayloadToTemplate } from './mail.mapper'
import { MAIL_CONFIG_TOKEN } from './mail.module-definitions'
import { MailPayload } from './mail.type'

@Processor(QueueName.MAILS, { concurrency: 5 })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name)
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>

  constructor(
    @Inject(MAIL_CONFIG_TOKEN)
    private readonly config: MailConfig,
    @InjectPinoLogger(MailProcessor.name)
    private readonly pinoLogger: PinoLogger,
  ) {
    super()

    this.logger.log('Initializing mail transporter ...', {
      host: config.host,
      port: config.port,
    })

    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: config.username,
        pass: config.password,
      },
    })
  }

  @WithPinoContext()
  async process(job: Job<MailPayload>): Promise<void> {
    this.pinoLogger.assign({ job: { id: job.id, name: job.name, queueName: job.queueName } })

    this.logger.log('Processing mail job ...')

    const { data } = job

    this.logger.log('Rendering template ...', { template: data.template })
    const html = await render(mapPayloadToTemplate(data))

    this.logger.log('Sending mail ...', { to: data.to, subject: data.subject, template: data.template })

    await this.transporter.sendMail({
      from: this.config.from,
      to: data.to,
      subject: data.subject,
      html,
    })
  }
}
