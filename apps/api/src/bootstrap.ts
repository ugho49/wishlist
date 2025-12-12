import type { INestApplication } from '@nestjs/common'

import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { Logger } from 'pino-nestjs'

import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './core/filters/exception.filter'

function bootstrapSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wishlist')
    .setDescription('The Wishlist API')
    .setVersion('1.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-Auth')
    .addSecurityRequirements('JWT-Auth')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('swagger', app, document)
}

export async function createApp(): Promise<INestApplication> {
  const isProduction = process.env.NODE_ENV === 'production'
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  app.useLogger(app.get(Logger))

  app.useGlobalPipes(new ValidationPipe({ transform: true, stopAtFirstError: true }))
  // Order of filters is important
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.enableCors()
  app.enableShutdownHooks()

  // Disable CSP in development for GraphiQL
  if (isProduction) {
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
  }

  bootstrapSwagger(app)

  return app
}
