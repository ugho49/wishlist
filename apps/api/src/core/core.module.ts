import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { BucketModule } from './bucket/bucket.module'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'
import { MailModule } from './mail/mail.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HealthModule,
    DatabaseModule,
    MailModule,
    BucketModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
})
export class CoreModule {}
