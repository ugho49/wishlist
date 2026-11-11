import { Config, Env, Secret } from '@znight/config';

import { MailProvider } from './mail.constants';

@Config()
export class MailConfig {
  @Env('MAIL_PROVIDER') provider!: MailProvider;
  @Env('MAILDEV_HOST') maildevHost = 'localhost';
  @Env('MAILDEV_PORT') maildevPort = 1025;
  @Secret('RESEND_API_KEY') resendApiKey?: string;
}
