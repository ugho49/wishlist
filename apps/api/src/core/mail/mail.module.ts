import { Module } from '@nestjs/common';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigType } from '@nestjs/config';
import mailConfig from './mail.config';
import type { HelperDeclareSpec } from 'handlebars';

const helpers: HelperDeclareSpec = {
  eq: (a, b) => a === b,
  eqNum: (a, b) => parseInt(a, 10) === parseInt(b, 10),
  ne: (a, b) => a !== b,
  neNum: (a, b) => parseInt(a, 10) !== parseInt(b, 10),
};

@Module({
  imports: [
    ConfigModule.forFeature(mailConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(mailConfig)],
      inject: [mailConfig.KEY],
      useFactory: (config: ConfigType<typeof mailConfig>) => ({
        transport: {
          host: config.host,
          port: config.port,
          auth: {
            user: config.auth.username,
            pass: config.auth.password,
          },
        },
        defaults: {
          from: config.from,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(helpers),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
})
export class MailModule {}
