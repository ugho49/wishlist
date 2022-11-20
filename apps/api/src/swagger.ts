import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function bootstrapSwagger(app: NestFastifyApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wishlist')
    .setDescription('The Wishlist API')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-Auth')
    .addSecurityRequirements('JWT-Auth')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
}
