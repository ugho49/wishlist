import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HealthModule,
    DatabaseModule,
    MailModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
})
export class CoreModule {}
