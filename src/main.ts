import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './presentation/common/filters/global-exception.filter';
import { EmployeePriceFilterInterceptor } from './presentation/common/interceptors/employee-price-filter.interceptor';
import { RequestContextInterceptor } from './presentation/common/interceptors/request-context.interceptor';
import { TransformDecimalInterceptor } from './presentation/common/interceptors/transform-decimal.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new RequestContextInterceptor(),
    new TransformDecimalInterceptor(),
    new EmployeePriceFilterInterceptor(),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(
    `Stokko API listening on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
}

void bootstrap();
