import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function bootstrapSwagger(app: INestApplication) {
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
