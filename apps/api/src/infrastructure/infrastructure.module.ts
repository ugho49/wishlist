import { join } from 'node:path'

import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { BucketModule } from '@wishlist/nestjs/modules/bucket'
import { MailModule } from '@wishlist/nestjs/modules/mail'

import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'

const mailModule = MailModule.registerAsync({
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

const bucketModule = BucketModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const firebaseServiceAccountKeyPath = config.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', '')

    return {
      firebaseServiceAccountKeyPath: join(__dirname, firebaseServiceAccountKeyPath),
      bucketName: config.get<string>('FIREBASE_BUCKET_NAME', ''),
      isMock: config.get<string>('FIREBASE_BUCKET_MOCK', 'false') === 'true',
    }
  },
})

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), HealthModule, mailModule, bucketModule, DatabaseModule],
})
export class InfrastructureModule {}
