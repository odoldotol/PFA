import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import {
  DocumentBuilder,
  SwaggerModule
} from '@nestjs/swagger';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { versioningOptions } from './versioningOptions.const';
import { AppTerminator } from './app/app.terminator';

const bootstrap = async () => {
  const logger = new Logger("NestApplication");

  const app = await NestFactory.create(AppModule);

  app.enableVersioning(versioningOptions);

  process.on('SIGINT', () => {
    app.get(AppTerminator).terminate(app);
  });

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
  
  const configService = app.get(ConfigService<EnvironmentVariables>);
  await app.listen(configService.get(EnvKey.Port, 7001, {infer: true})); logger.log('App listen');
  
  configService.get(EnvKey.Pm2_name, {infer: true}) && process.send &&
  process.send(
      'ready',
      logger.log("Send Ready to Parent Process"),
      { swallowErrors: true},
      err => err && logger.error(err));

};

bootstrap();
