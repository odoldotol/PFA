import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClient, SetOptions } from 'redis';

@Injectable()
export class ConnectService implements OnModuleInit {

    private readonly logger = new Logger(ConnectService.name);
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

        // await this.client.set("aapl", 125, {
        //     EX: 10
        // });
    }

}