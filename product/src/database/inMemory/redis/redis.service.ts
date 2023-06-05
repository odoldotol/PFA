import { Injectable } from "@nestjs/common";
import { ConnectService } from "./connect.service";

@Injectable()
export class RedisService implements InMemoryStoreServiceI {

    private readonly client = this.connectSrv.client;

    constructor(
        private readonly connectSrv: ConnectService
    ) {}

    getAllKeys = () => this.client.sendCommand([
        "KEYS", "*" // scan 사용하기
    ]) as Promise<string[]>;
    
    setCache = <T>([key, value, ttl]: [string, T, number]) => Promise.resolve(value);

    deleteCache = (key: string) => Promise.resolve(true);

    getValue = (key: string) => Promise.resolve("value1");

    /**
     * ### redis key prefix 제거
     * 문자열에서 : 를 찾아서 제일 마지막에 있는 : 를 기준으로 : 포함 앞에 있는 문자열을 제거한 문자열 반환.
     */
    static getKeyBody = (key: string) => key.slice(key.lastIndexOf(":")+1);

}