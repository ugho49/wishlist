import type * as SMTPTransport from 'nodemailer/lib/smtp-transport'

import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import { render } from '@react-email/render'
import { Job } from 'bullmq'
import { createTransport, type Transporter } from 'nodemailer'
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs'
import { createElement } from 'react'

import { QueueName, WithPinoContext } from '../queue'
import { MailConfig } from './mail.config'
import { MAIL_CONFIG_TOKEN } from './mail.module-definitions'
import { MailPayload, MailTemplate } from './mail.type'
import {
  AddedToEventEmail,
  AddedToEventNewUserEmail,
  AddedToWishlistAsCoOwnerEmail,
  ConfirmEmailChangeEmail,
  EmailChangedConfirmationEmail,
  EmailChangedSuccessEmail,
  EmailChangeNotificationEmail,
  NewItemsReminderEmail,
  ResetPasswordEmail,
  SecretSantaCancelEmail,
  SecretSantaDrawEmail,
  WelcomeUserEmail,
} from './templates'

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
    const html = await this.renderTemplate(data)

    this.logger.log('Sending mail ...', { to: data.to, subject: data.subject, template: data.template })

    await this.transporter.sendMail({
      from: this.config.from,
      to: data.to,
      subject: data.subject,
      html,
    })
  }

  private renderTemplate(payload: MailPayload): Promise<string> {
    switch (payload.template) {
      case MailTemplate.WELCOME_USER:
        return render(createElement(WelcomeUserEmail, payload.context))
      case MailTemplate.SECRET_SANTA_DRAW:
        return render(createElement(SecretSantaDrawEmail, payload.context))
      case MailTemplate.SECRET_SANTA_CANCEL:
        return render(createElement(SecretSantaCancelEmail, payload.context))
      case MailTemplate.RESET_PASSWORD:
        return render(createElement(ResetPasswordEmail, payload.context))
      case MailTemplate.NEW_ITEMS_REMINDER:
        return render(createElement(NewItemsReminderEmail, payload.context))
      case MailTemplate.ADDED_TO_EVENT:
        return render(createElement(AddedToEventEmail, payload.context))
      case MailTemplate.ADDED_TO_EVENT_NEW_USER:
        return render(createElement(AddedToEventNewUserEmail, payload.context))
      case MailTemplate.ADDED_TO_WISHLIST_AS_CO_OWNER:
        return render(createElement(AddedToWishlistAsCoOwnerEmail, payload.context))
      case MailTemplate.CONFIRM_EMAIL_CHANGE:
        return render(createElement(ConfirmEmailChangeEmail, payload.context))
      case MailTemplate.EMAIL_CHANGE_NOTIFICATION:
        return render(createElement(EmailChangeNotificationEmail, payload.context))
      case MailTemplate.EMAIL_CHANGED_CONFIRMATION:
        return render(createElement(EmailChangedConfirmationEmail, payload.context))
      case MailTemplate.EMAIL_CHANGED_SUCCESS:
        return render(createElement(EmailChangedSuccessEmail, payload.context))
    }
  }
}
