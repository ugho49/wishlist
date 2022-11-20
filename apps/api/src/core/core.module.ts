import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    HealthModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
})
export class CoreModule {}
