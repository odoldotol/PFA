import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app';
import { AppConfigService } from './config';
import { Pm2Service } from './pm2/pm2.service';
import { versioningOptions } from './config';
import setupSwagger from './setupSwagger';
import addTerminator from './addTerminator';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning(versioningOptions);
  
  setupSwagger(app);
  
  await app.listen(app.get(AppConfigService).getPort());

  app.get(Pm2Service).sendReady();

  addTerminator(app);
};

bootstrap();
