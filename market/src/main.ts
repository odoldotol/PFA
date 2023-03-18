import { CallHandler, ExecutionContext, NestInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Observable } from 'rxjs';

async function bootstrap() {

  const logger = new Logger("NestApplication");
  let keepAlive = true;

  const app = await NestFactory.create(AppModule).then(app => (logger.log('App created'), app));

  // adminFE 와 product 만 허용하면 됨
  app.enableCors();

  // keepAlive 인터셉터
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

  /**
   * ### 서버 종료 동작
   */
  const closing = async () => {
    keepAlive = false;

    await app.close();
    logger.log('Server closed');
    process.exit(0);
  };

  // SIGINT
  process.on('SIGINT', () => {
    closing();
  });

  await app.listen(process.env.PORT || 6000).then(() => {
    logger.log('App listen');
    if (process.env.PM2_NAME) {
      process.send('ready', logger.log("Send Ready to Parent Process"), { swallowErrors: false}, (err) => {
        if (err) logger.error(err);
      });
      // 나의 pm2_id 찾아서 나를 대체하는 새로운 앱이 준비되면 나를 종료하기
      const pid = process.pid;
      let pm2_id: number
      const pm2_name = process.env.PM2_NAME;
      const pm2 = require('pm2');
      pm2.connect(err => process.exit(2));
      pm2.list((err, list) => {
        err && process.exit(2);
        try {
          pm2_id = list.find(p => p.pid === pid).pm_id;
        } catch (e) { // old process reloaded
          pm2_id = undefined;
          logger.log(`Old ${pm2_name} is reloaded...`)
        };
        pm2.launchBus((err, pm2_bus) => {
          pm2_bus.on('process:msg', packet => {
            if (packet.raw === 'ready' && packet.process.name === pm2_name && packet.process.pm_id === pm2_id) {
              logger.log(`I confirmed that New ${pm2_name} was ready`);
              // closing(); // 다시 살리려고함
              // process.kill(pid, 'SIGINT'); // 다시 살리려고함
              // pm2.delete(`_old_${pm2_id}`); // 다시 살리려고함
              // pm2.stop(`_old_${pm2_id}`); // 다시 살림
            };
          });
        });
      });
    };
  });

}
bootstrap();
