import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { createClient } from 'redis';

@Injectable()
export class ConnectService implements OnModuleInit, OnApplicationShutdown {

    private readonly logger = new Logger("Redis-" + ConnectService.name);
    private readonly redisClient = createClient();

    constructor() {
        this.listenEvents();}

    async onModuleInit() {
        this.client.isOpen || await this.client.connect();}

    async onApplicationShutdown() {
        this.client.isOpen && await this.client.disconnect();}

    get client() {
        return this.redisClient;
    }

    private listenEvents() {
        this.redisClient.on('connect', () => { // isOpen, isNotReady
            this.logger.log('Initiating a connection to the server');});

        this.redisClient.on('ready', () => { // isOpen, isReady
            this.logger.log('Client is ready to use');});

        this.redisClient.on('reconnecting', () => {
            this.logger.log('Client is trying to reconnect to the server');});

        this.redisClient.on('end', () => {
            this.logger.log('Connection has been closed');});

        this.redisClient.on('error', (err) => {
            this.logger.error(err);});
    }

}