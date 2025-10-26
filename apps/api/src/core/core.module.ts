import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { path } from '../helpers'
import { BucketModule } from './bucket/bucket.module'
import { DatabaseModule } from './database/database.module'
import { HealthModule } from './health/health.module'
import { MailModule } from './mail/mail.module'
import { QueueModule } from './queue/queue.module'

const bucketModule = BucketModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const firebaseServiceAccountKeyPath = config.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_KEY_PATH',
      path('firebase/firebase-config.json'),
    )

    return {
      firebaseServiceAccountKeyPath,
      bucketName: config.get<string>('FIREBASE_BUCKET_NAME', ''),
      isMock: config.get<string>('FIREBASE_BUCKET_MOCK', 'false') === 'true',
    }
  },
})

const mailModule = MailModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const mailTemplateDir = config.get<string>('MAIL_TEMPLATE_DIR', path('templates'))

    return {
      from: 'Wishlist App <contact@wishlistapp.fr>',
      host: config.get<string>('MAIL_HOST', 'localhost'),
      port: parseInt(config.get<string>('MAIL_PORT', '1025'), 10),
      username: config.get<string>('MAIL_USERNAME', ''),
      password: config.get<string>('MAIL_PASSWORD', ''),
      templateDir: mailTemplateDir,
    }
  },
})

const databaseModule = DatabaseModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const dbMigrationsFolder = config.get<string>('DB_MIGRATIONS_FOLDER', path('drizzle/migrations'))

    return {
      username: config.get<string>('DB_USERNAME', ''),
      password: config.get<string>('DB_PASSWORD', ''),
      database: config.get<string>('DB_NAME', ''),
      host: config.get<string>('DB_HOST', ''),
      port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
      runMigrations: config.get<string>('DB_RUN_MIGRATIONS', 'true') === 'true',
      migrationsFolder: dbMigrationsFolder,
      verbose: config.get<string>('DB_VERBOSE', 'false') === 'true',
    }
  },
})

@Global()
@Module({
  imports: [ScheduleModule.forRoot(), HealthModule, databaseModule, mailModule, bucketModule, QueueModule],
})
export class CoreModule {}
