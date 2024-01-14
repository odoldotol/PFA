import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from 'redis';
import { EnvKey } from "src/common/enum/envKey.emun";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { buildLoggerContext } from "src/common/util";

@Injectable()
export class ConnectionService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(buildLoggerContext("Redis", ConnectionService.name));
  private readonly redisClient = createClient({
    url: this.configService.get(EnvKey.DOCKER_REDIS_URL, 'redis://localhost:6379')!,
  });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    this.listenEvents();
  }

  async onModuleInit() {
    await new Promise<void>(async (resolve, reject) => {
      setTimeout(() => reject(new Error("Redis connection timeout")), 5000);
      this.client.isOpen || await this.client.connect();
      resolve();
    });
  }

  async onApplicationShutdown() {
    this.client.isOpen && await this.client.disconnect();
  }

  public get client() {
    return this.redisClient;
  }

  private listenEvents() {
    this.redisClient.on('connect', () => { // isOpen, isNotReady
      this.logger.log('Initiating a connection to the server');
    });

    this.redisClient.on('ready', () => { // isOpen, isReady
      this.logger.log('Client is ready to use');
    });

    this.redisClient.on('reconnecting', () => {
      // Todo: retryStrategy, http 모듈에 있는거 일부분 빼내서 여기서 썌도 될듯.
      this.logger.log('Client is trying to reconnect to the server');
    });

    this.redisClient.on('end', () => {
      this.logger.log('Connection has been closed');
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(err);
    });
  }

}