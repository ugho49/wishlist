import type * as SMTPTransport from 'nodemailer/lib/smtp-transport';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

import { type MailPayload, type MailProvider } from '../mail.type';
import { getMailPayloadFromMailOptions } from './mail-provider.utils';

export class MaildevMailProvider implements MailProvider {
  private readonly logger = new Logger(MaildevMailProvider.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(configService: ConfigService) {
    const maildevUrl = configService.get('MAILDEV_HOST', 'localhost');
    const maildevPort = Number(configService.get('MAILDEV_PORT', '1025'));

    this.transporter = createTransport({
      host: maildevUrl,
      port: maildevPort,
      secure: false,
    });
  }

  async send(options: MailPayload): Promise<void> {
    this.logger.log('Sending mail with Maildev', {
      mail: {
        to: options.to,
        template: options.template,
        context: options.context,
      },
    });

    const { from, html } = await getMailPayloadFromMailOptions(options);

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send email with Maildev', { error });
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.logger.debug('Email sent with Maildev');
  }
}
