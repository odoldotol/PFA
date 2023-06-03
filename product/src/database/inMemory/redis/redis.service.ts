import { Injectable } from "@nestjs/common";
import { ConnectService } from "./connect.service";

@Injectable()
export class RedisService implements InMemoryStoreServiceI {

    private readonly client = this.connectSrv.client;

    constructor(
        private readonly connectSrv: ConnectService
    ) {}

    getAllKeys = () => Promise.resolve(["key1", "key2"]);
    
    setCache = <T>([key, value, ttl]: [string, T, number]) => Promise.resolve(value);

    deleteCache = (key: string) => Promise.resolve(true);

    getValue = (key: string) => Promise.resolve("value1");

}