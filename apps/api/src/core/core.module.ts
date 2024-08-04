import { join } from 'node:path'

import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { BucketModule } from './bucket/bucket.module'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'
import { MailModule } from './mail/mail.module'

const bucketModule = BucketModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const firebaseServiceAccountKeyPath = config.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', '')

    return {
      firebaseServiceAccountKeyPath: join(__dirname, firebaseServiceAccountKeyPath),
      bucketName: config.get<string>('FIREBASE_BUCKET_NAME', ''),
      isMock: config.get<boolean>('FIREBASE_BUCKET_MOCK', false),
    }
  },
})

const mailModule = MailModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    from: 'Wishlist App <contact@wishlistapp.fr>',
    host: config.get<string>('MAIL_HOST', 'localhost'),
    port: parseInt(config.get<string>('MAIL_PORT', '1025'), 10),
    username: config.get<string>('MAIL_USERNAME', ''),
    password: config.get<string>('MAIL_PASSWORD', ''),
    templateDir: join(__dirname, config.get<string>('MAIL_TEMPLATE_DIR', 'templates')),
  }),
})

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), HealthModule, DatabaseModule, mailModule, bucketModule],
})
export class CoreModule {}
