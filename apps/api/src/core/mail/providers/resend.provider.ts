import type { MailConfig } from '../mail.config';

import { getLogger } from '@znight/observability';
import { Resend } from 'resend';

import { type MailPayload, type MailProvider } from '../mail.type';
import { getMailPayloadFromMailOptions } from './mail-provider.utils';

export class ResendMailProvider implements MailProvider {
  private readonly logger = getLogger(ResendMailProvider.name);
  private readonly resend: Resend;

  constructor(config: MailConfig) {
    if (!config.resendApiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    this.resend = new Resend(config.resendApiKey);
  }

  async send(options: MailPayload): Promise<void> {
    this.logger.info('Sending mail with Resend', {
      mail: {
        to: options.to,
        template: options.template,
        context: options.context,
      },
    });

    const { from, html } = await getMailPayloadFromMailOptions(options);

    const { data, error } = await this.resend.emails.send(
      {
        from,
        to: options.to,
        subject: options.subject,
        html,
      },
      options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
    );

    if (error) {
      this.logger.error('Failed to send email with Resend', { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    this.logger.debug('Email sent with Resend', { data });
  }
}
