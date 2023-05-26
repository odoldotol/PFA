import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClient } from 'redis';

@Injectable()
export class RedisConnectService implements OnModuleInit {

    private readonly logger = new Logger(RedisConnectService.name);
    private readonly client = createClient();

    constructor() {}

    async onModuleInit() {
        this.client.on('connect', () => {
            this.logger.log('Redis connected');
        });
        this.client.on('error', (err) => {
            this.logger.error(err);
        });

        await this.client.connect();
    }

}