import { Factory, Provides } from '@znight/core';
import { getLogger } from '@znight/observability';
import { match } from 'ts-pattern';

import { MailConfig } from './mail.config';
import { MailProvider as MailProviderName } from './mail.constants';
import { type MailProvider } from './mail.type';
import { MaildevMailProvider } from './providers/maildev.provider';
import { ResendMailProvider } from './providers/resend.provider';

@Factory()
export class MailFactory {
  private readonly logger = getLogger(MailFactory.name);

  @Provides()
  mailProvider(config: MailConfig): MailProvider {
    this.logger.info(`Mail provider configured to use '${config.provider}'`);

    return match(config.provider)
      .with(MailProviderName.RESEND, () => new ResendMailProvider(config))
      .with(MailProviderName.MAILDEV, () => new MaildevMailProvider(config))
      .exhaustive();
  }
}
