import { NestFactory } from '@nestjs/core';
import { AppModule } from './app';
import { AppConfigService } from './config';
import { Pm2Service } from './pm2/pm2.service';
import { versioningOptions } from './config';
import helmet from 'helmet';
import setupSwagger from './setupSwagger';
import { Terminator } from './terminator';
import 'src/openTelemetry';
import { DefaultLogger } from './logger';


const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet()); // 헤더 보안 설정은 nginx 에서 처리하는 것이 더 좋을까?

  app.setGlobalPrefix('api', {
    exclude: [ 'health' ],
  });
  app.enableVersioning(versioningOptions);
  
  setupSwagger(app);
  
  app.useLogger(app.get(DefaultLogger));

  await app.listen(app.get(AppConfigService).getPort());

  app.get(Pm2Service).sendReady();

  Terminator.add(app);
};

bootstrap();
