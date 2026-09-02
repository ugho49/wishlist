import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { match } from 'ts-pattern';
import z from 'zod';

import { MAIL_PROVIDER, MailProvider } from './mail.constants';
import { MailProcessor } from './mail.processor';
import { MailService } from './mail.service';
import { MaildevMailProvider } from './providers/maildev.provider';
import { ResendMailProvider } from './providers/resend.provider';

const providerSchema = z.object({
  MAIL_PROVIDER: z.enum(MailProvider),
});

@Global()
@Module({
  providers: [
    MailProcessor,
    MailService,
    {
      provide: MAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const result = providerSchema.safeParse({ MAIL_PROVIDER: configService.get('MAIL_PROVIDER') });

        if (!result.success) {
          throw new Error(z.prettifyError(result.error));
        }

        const logger = new Logger(MailModule.name);
        logger.log(`Mail provider configured to use '${result.data.MAIL_PROVIDER}'`);

        return match(result.data.MAIL_PROVIDER)
          .with(MailProvider.RESEND, () => new ResendMailProvider(configService))
          .with(MailProvider.MAILDEV, () => new MaildevMailProvider(configService))
          .exhaustive();
      },
    },
  ],
  exports: [MailService],
})
export class MailModule {}
