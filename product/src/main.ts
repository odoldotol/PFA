import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { versioningOptions } from './versioningOptions.const';
import { AppTerminator } from './app/app.terminator';
import { config } from './openApiConfig.const';

const bootstrap = async () => {
  const logger = new Logger("NestApplication");
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<EnvironmentVariables>);

  app.enableVersioning(versioningOptions);

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, config)
  );
  
  await app.listen(configService.get(EnvKey.Port, 7001, { infer: true }));
  logger.log('App listen');
  
  configService.get(EnvKey.Pm2_name, { infer: true })
  && process.send
  && process.send(
    'ready',
    logger.log("Send Ready to Parent Process"),
    { swallowErrors: true },
    err => err && logger.error(err)
  );

  process.on('SIGINT', () => {
    app.get(AppTerminator).terminate(app);
  });
};

bootstrap();
