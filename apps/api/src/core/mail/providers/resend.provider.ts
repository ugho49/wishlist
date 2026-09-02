import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { type MailPayload, type MailProvider } from '../mail.type';
import { getMailPayloadFromMailOptions } from './mail-provider.utils';

export class ResendMailProvider implements MailProvider {
  private readonly logger = new Logger(ResendMailProvider.name);
  private readonly resend: Resend;

  constructor(configService: ConfigService) {
    const resendApiKey = configService.getOrThrow('RESEND_API_KEY');

    this.resend = new Resend(resendApiKey);
  }

  async send(options: MailPayload): Promise<void> {
    this.logger.log('Sending mail with Resend', {
      mail: {
        to: options.to,
        template: options.template,
        context: options.context,
      },
    });

    const { from, html } = await getMailPayloadFromMailOptions(options);

    const { data, error } = await this.resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html,
    });

    if (error) {
      this.logger.error('Failed to send email with Resend', { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    this.logger.debug('Email sent with Resend', { data });
  }
}
