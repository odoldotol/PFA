import { CallHandler, ExecutionContext, Logger, NestInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Response } from 'express';

async function bootstrap() {

  const logger = new Logger("NestApplication");
  let keepAlive = true;

  const app = await NestFactory.create(AppModule).then(app => (logger.log('App created'), app));

  const configService = app.get(ConfigService);

  app.enableCors(); // adminFE, 서비스FE + 기타 서비스(Kakao 등) 허용하면 됨

  app.useGlobalInterceptors(
    new class KeepAliveInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, next: CallHandler) {
        if (keepAlive === false) {
          logger.verbose('KeepAliveInterceptor : Disable keepAlive');
          context.switchToHttp().getResponse<Response>().set('Connection', 'close');
        };
        return next.handle();
      }});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  process.on('SIGINT', () => {
    appTerminator();
  });
  
  await app.listen(configService.get<number>("PORT", 7000));
  
  logger.log('App listen');
  
  if (configService.get<string>("PM2_NAME")) process.send('ready',
    logger.log("Send Ready to Parent Process"),
    { swallowErrors: true}, (err) => err && logger.error(err)
  );

  const appTerminator = async () => {
    keepAlive = false;
    await app.close();
    logger.log('Server closed');
    process.exit(0);
  };

}
bootstrap();
