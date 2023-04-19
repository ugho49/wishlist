import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrapSwagger } from './swagger';
import helmet from 'helmet';
import 'pg';

async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, stopAtFirstError: true }));
  app.enableCors();
  app.enableShutdownHooks();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    })
  );

  bootstrapSwagger(app);

  return app;
}

async function start() {
  Logger.log('Starting server ...');

  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port, '0.0.0.0');

  Logger.log(`📚 Swagger available on: http://localhost:${port}/api`);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

void start();
