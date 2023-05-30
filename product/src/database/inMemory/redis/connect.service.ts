import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClient } from 'redis';

@Injectable()
export class ConnectService implements OnModuleInit {

    private readonly logger = new Logger("Redis-" + ConnectService.name);
    private readonly redisClient = createClient();

    constructor() {
        this.listenEvents();}

    async onModuleInit() {
        await this.client.connect();}

    get client() {
        return this.redisClient;
    }

    private listenEvents() {
        this.redisClient.on('connect', () => {
            this.logger.log('Initiating a connection to the server');});

        this.redisClient.on('ready', () => {
            this.logger.log('Client is ready to use');});

        this.redisClient.on('reconnecting', () => {
            this.logger.log('Client is trying to reconnect to the server');});

        this.redisClient.on('end', () => {
            this.logger.log('Connection has been closed');});

        this.redisClient.on('error', (err) => {
            this.logger.error(err);});
    }

}