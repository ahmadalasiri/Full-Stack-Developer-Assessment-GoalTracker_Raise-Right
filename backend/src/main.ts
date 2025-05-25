import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security: Use Helmet to protect against common web vulnerabilities
  app.use(helmet());

  // Security: Configure CORS with specific origins
  const corsOrigins = configService.get('CORS_ORIGINS', '*');
  const origins = corsOrigins === '*' ? '*' : corsOrigins.split(',');

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Security: Apply rate limiting to prevent brute force and DDoS attacks
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // HTTP request logging
  app.use(morgan('combined'));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('GoalTracker API')
    .setDescription('Smart Personal & Public Goal Management Tool API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('goals', 'Goals management endpoints')
    .addTag('public-goals', 'Public goals endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
    console.log(
      `📚 Swagger documentation available at: http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting the application:', error);
  process.exit(1);
});
