import type { INestApplication } from '@nestjs/common'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'

import { AppModule } from './app.module'

function bootstrapSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wishlist')
    .setDescription('The Wishlist API')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-Auth')
    .addSecurityRequirements('JWT-Auth')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, document)
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ transform: true, stopAtFirstError: true }))
  app.enableCors()
  app.enableShutdownHooks()

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
    }),
  )

  bootstrapSwagger(app)

  return app
}
