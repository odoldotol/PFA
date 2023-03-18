import { CallHandler, ExecutionContext, NestInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Observable } from 'rxjs';

async function bootstrap() {

  const logger = new Logger("NestApplication");
  let keepAlive = true;

  const app = await NestFactory.create(AppModule).then(app => (logger.log('App created'), app));

  // admin 과 product 만 허용
  app.enableCors();

  app.useGlobalInterceptors(
    new class KeepAliveInterceptor implements NestInterceptor {
      intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (keepAlive === false) {
          console.log('KeepAliveInterceptor : Disable keepAlive');
          context.switchToHttp().getResponse().set('Connection', 'close');
        };
        return next.handle();
      }
    }
  );

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  process.on('SIGINT', async () => {
    keepAlive = false;

    await app.close();
    logger.log('Server closed');
    process.exit(0);
  });

  await app.listen(process.env.PORT || 6000);
  logger.log('App listen');

  process.send ? (process.send('ready'), logger.log("Send Ready to Parent Process")) : logger.log("Ready!!");

}
bootstrap();
