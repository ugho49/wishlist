import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule as NestThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import Redis from 'ioredis'

@Global()
@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redis = new Redis({
          host: config.get<string>('VALKEY_HOST', 'localhost'),
          port: Number.parseInt(config.get<string>('VALKEY_PORT', '6379'), 10),
          password: config.get<string>('VALKEY_PASSWORD', ''),
          db: Number.parseInt(config.get<string>('VALKEY_DB', '0'), 10),
          keyPrefix: `${config.get<string>('VALKEY_KEY_PREFIX', 'wishlist:')}throttler:`,
        })

        return {
          throttlers: [
            {
              name: 'default',
              ttl: 60000, // 1 minute
              limit: 60, // 60 requests per minute
            },
            {
              name: 'auth',
              ttl: 900000, // 15 minutes
              limit: 10, // 10 requests per 15 minutes for auth endpoints
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
          skipIf: () => false, // Always apply throttling
        }
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [NestThrottlerModule],
})
export class ThrottlerModule {}
