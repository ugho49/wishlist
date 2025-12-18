import type * as SMTPTransport from 'nodemailer/lib/smtp-transport'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import * as Handlebars from 'handlebars'
import mjml2html from 'mjml'
import { createTransport, type Transporter } from 'nodemailer'
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs'

import { QueueName, WithPinoContext } from '../queue'
import { MailConfig } from './mail.config'
import { MAIL_CONFIG_TOKEN } from './mail.module-definitions'
import { MailPayload } from './mail.type'
import { helpers } from './mail.utils'

@Processor(QueueName.MAILS, { concurrency: 5 })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name)
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>
  private readonly templateCache: Map<string, string> = new Map()

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
      templateFolder: config.templateDir,
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
    const templatePath = join(this.config.templateDir, `${data.template}.mjml`)

    if (!this.templateCache.has(templatePath)) {
      const fileContent = await readFile(templatePath, 'utf8')
      const templatedContent = mjml2html(fileContent).html
      this.logger.log('Compiling template ...', { templatePath })
      this.templateCache.set(templatePath, templatedContent)
    }

    const templateSource = this.templateCache.get(templatePath)
    const template = Handlebars.compile(templateSource, { strict: true })
    const html = template(data.context, { helpers })

    this.logger.log('Sending mail ...', { to: data.to, subject: data.subject, template: data.template })

    await this.transporter.sendMail({
      from: this.config.from,
      to: data.to,
      subject: data.subject,
      html,
    })
  }
}
