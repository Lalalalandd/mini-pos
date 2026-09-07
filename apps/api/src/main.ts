import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for REST APIs
  app.setGlobalPrefix('api', {
    exclude: ['graphql'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Middlewares
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Mini POS & Mini Ecommerce API')
    .setDescription(
      'Robust backend services for in-store POS checkout, online catalog GraphQL queries, inventory management, and BullMQ background tasks.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'JWT Authentication & token rotation')
    .addTag('Products', 'Inventory and product catalog CRUD')
    .addTag('Categories', 'Product taxonomy & grouping')
    .addTag('POS', 'Cashier rapid barcode scanner & checkout terminal')
    .addTag('Orders', 'Order fulfillment & real-time store metrics')
    .addTag('Users', 'User role management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Mini POS API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 NestJS Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 OpenAPI / Swagger UI: http://localhost:${port}/api/docs`);
  logger.log(`🪐 GraphQL Endpoint: http://localhost:${port}/graphql`);
}

bootstrap();
