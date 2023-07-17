import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import versioningOption from './versioningOption.const';
import { KeepAliveInterceptor } from './app/intercepter/keepAlive.intercepter';

bootstrap();

async function bootstrap() {
  const logger = new Logger("NestApplication");

  const app = await NestFactory.create(AppModule);

  app.enableVersioning(versioningOption);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,}));

  process.on('SIGINT', () => {
    appTerminator();});

  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, new DocumentBuilder()
    .setTitle('LAPIKI Market API')
    .setVersion('1.0')
    .setDescription('Market Data')
    .setContact('Lygorithm', 'https://github.com/odoldotol', 'lygorithm@gmail.com')
    .addTag('App', 'default')
    .addTag('Updater')
    .addTag('Config')
    .addTag('Development')
    .build()));

  const configService = app.get(ConfigService<EnvironmentVariables>);
  await app.listen(configService.get(EnvKey.Port, 6001, {infer: true})); logger.log('App listen');

  configService.get(EnvKey.Pm2_name, {infer: true}) && process.send &&
    process.send(
      'ready',
      logger.log("Send Ready to Parent Process"),
      { swallowErrors: true},
      err => err && logger.error(err));

  const appTerminator = async () => {
    app.get(KeepAliveInterceptor).disableKeepAlive();
    await app.close();
    logger.log('Server closed');
    process.exit(0);};

}
