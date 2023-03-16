import { CallHandler, ExecutionContext, NestInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Observable } from 'rxjs';

async function bootstrap() {
  let keepAlive = true;

  const app = await NestFactory.create(AppModule);

  // admin, FE + 기타 서비스(Kakao 등) 허용
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
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  await app.listen(process.env.PORT || 7000);

  process.on('SIGINT', async () => {
    keepAlive = false;

    await app.close();
    console.log('Server closed');
    process.exit(0);
  });
}
bootstrap();
