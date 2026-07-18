import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { configureSwagger } from './config/swagger/swagger.configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
  });

  configureSwagger(app);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  configureSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
