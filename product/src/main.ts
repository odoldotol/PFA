// Todo: dedup(market, product)

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { versioningOptions } from 'src/config/const';
import setupSwagger from './setupSwagger';
import addTerminator from './addTerminator';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  
  app.enableVersioning(versioningOptions);
  
  setupSwagger(app);
    
  const configService = app.get(ConfigService<EnvironmentVariables>);
  const port = configService.get(EnvKey.PORT, 7001, { infer: true });
  
  await app.listen(port);

  // Todo: pm2Module 안으로 옮기고 꺼내서 쓰기 --------------------
  const logger = new Logger("PM2Messenger")
  
  configService.get(EnvKey.PM2_NAME, { infer: true }) &&
  process.send &&
  process.send(
    'ready',
    logger.log("Send Ready to Parent Process"),
    { swallowErrors: true },
    err => err && logger.error(err)
  );
  // --------------------------------------------------------

  addTerminator(app);
};

bootstrap();
