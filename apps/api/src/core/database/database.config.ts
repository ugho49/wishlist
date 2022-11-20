import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import migrations from './migrations';

export default registerAs(
  'db',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    namingStrategy: new SnakeNamingStrategy(),
    autoLoadEntities: true,
    synchronize: false, // Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
    migrationsRun: true,
    migrations,
    logging: process.env.DB_VERBOSE === 'true' || false,
    // dropSchema: true, // ⚠️⚠️ DEV MODE ONLY ⚠️⚠️ Uncomment this if you want to drop all database
  })
);
