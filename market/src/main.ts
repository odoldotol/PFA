import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  .then(app => {
    console.log(`MongoDB Connected on ${process.env.MONGO_database}`);
    return app;
  });

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is running on port ${process.env.PORT || 6000}`);
  });
}
bootstrap();
