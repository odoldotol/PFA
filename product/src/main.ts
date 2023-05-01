import { CallHandler, ExecutionContext, Logger, NestInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

bootstrap();

async function bootstrap() {
  const logger = new Logger("NestApplication");
  let keepAlive = true;

  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
    defaultVersion: '1',});

  app.useGlobalInterceptors(
    new class KeepAliveInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, next: CallHandler) {
        if (keepAlive === false) {
          logger.verbose('KeepAliveInterceptor : Disable keepAlive');
          context.switchToHttp().getResponse<Response>().set('Connection', 'close');};
        return next.handle();}});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true}));

  process.on('SIGINT', () => {
    appTerminator();});

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, new DocumentBuilder()
  .setTitle('LAPIKI Product API')
  .setVersion('1.0')
  .setDescription('Product')
  .setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
  .addTag('App')
  .addTag('Kakao Chatbot')
  .addTag('Market')
  .addTag('Development')
  .build()));
  
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>("PORT", 7001)); logger.log('App listen');
  
  configService.get<string>("PM2_NAME") && process.send &&
  process.send(
      'ready',
      logger.log("Send Ready to Parent Process"),
      { swallowErrors: true},
      err => err && logger.error(err));

  const appTerminator = async () => {
    keepAlive = false;
    await app.close();
    logger.log('Server closed');
    process.exit(0);};

}
