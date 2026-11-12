import type { MailConfig } from '../mail.config';

import { getLogger } from '@znight/observability';
import { createTransport, type SMTPSentMessageInfo, type Transporter } from 'nodemailer';

import { type MailPayload, type MailProvider } from '../mail.type';
import { getMailPayloadFromMailOptions } from './mail-provider.utils';

export class MaildevMailProvider implements MailProvider {
  private readonly logger = getLogger(MaildevMailProvider.name);
  private readonly transporter: Transporter<SMTPSentMessageInfo>;

  constructor(config: MailConfig) {
    this.transporter = createTransport({
      host: config.maildevHost,
      port: config.maildevPort,
      secure: false,
    });
  }

  async send(options: MailPayload): Promise<void> {
    this.logger.info('Sending mail with Maildev', {
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
