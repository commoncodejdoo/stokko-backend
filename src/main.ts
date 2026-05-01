import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './presentation/common/filters/global-exception.filter';
import { TransformDecimalInterceptor } from './presentation/common/interceptors/transform-decimal.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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
  app.useGlobalInterceptors(new TransformDecimalInterceptor());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  Logger.log(
    `Stokko API listening on http://localhost:${port}/api/v1`,
    'Bootstrap',
  );
}

void bootstrap();
