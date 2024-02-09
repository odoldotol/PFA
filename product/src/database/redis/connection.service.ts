import { Inject, Logger } from '@nestjs/common';
import { createClient } from 'redis';
import EventEmitter from 'events';
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition';
import { RedisModuleOptions } from './interface';
import { buildLoggerContext } from 'src/common/util';

export class ConnectionService {

  private readonly logger
  = new Logger(buildLoggerContext("Redis", ConnectionService.name));

  constructor (
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: RedisModuleOptions,
  ) {}

  public async connect() {

    const client = createClient(this.options);

    this.listenEvents(client);

    client.isOpen ||
    await client.connect();

    return client;
  }

  private listenEvents(client: EventEmitter) {
    client.on('connect', () => { // isOpen, isNotReady
      this.logger.log('Initiating a connection to the server');
    });

    client.on('ready', () => { // isOpen, isReady
      this.logger.log('Client is ready to use');
    });

    client.on('reconnecting', () => {
      // Todo: retryStrategy, http 모듈에 있는거 일부분 빼내서 여기서 썌도 될듯.
      this.logger.log('Client is trying to reconnect to the server');
    });

    client.on('end', () => {
      this.logger.log('Connection has been closed');
    });

    client.on('error', (err) => {
      this.logger.error(err);
    });
  }

}
