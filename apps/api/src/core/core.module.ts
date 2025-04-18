import { join } from 'node:path'

import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { BucketModule } from './bucket/bucket.module'
import { DatabaseModule } from './database/database.module'
import { MailModule } from './mail/mail.module'

const bucketModule = BucketModule.registerAsync({
  isGlobal: true,
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

const databaseModule = DatabaseModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    host: config.getOrThrow('DB_HOST'),
    port: parseInt(config.getOrThrow('DB_PORT'), 10),
    username: config.getOrThrow('DB_USERNAME'),
    password: config.getOrThrow('DB_PASSWORD'),
    database: config.getOrThrow('DB_NAME'),
    verbose: config.get<string>('DB_VERBOSE', 'false') === 'true',
  }),
})

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), mailModule, bucketModule, databaseModule],
})
export class CoreModule {}
