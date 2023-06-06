import { Injectable } from "@nestjs/common";
import { ConnectService } from "./connect.service";

@Injectable()
export class RedisService implements InMemoryStoreServiceI {

    private readonly client = this.connectSrv.client;

    constructor(
        private readonly connectSrv: ConnectService
    ) {}

    /**
     * ### Todo: Refac
     * - 더 작은 함수로 나누기
     * - while 문 제거하기(재귀적으로 구현하거나 F.range 쓰거나?)
     * - result, cursor 변수선언을 제거하기
     */
    getAllKeys = async () => {
        let result: string[] = [];
        let cursor: number|true = true;

        while (cursor) {
            cursor === true ? cursor = 0 : cursor;
            const scanReturn = await this.client.sendCommand([
                "SCAN", `${cursor}`, "MATCH", "*", "COUNT", "100"
            ]) as [string, string[]];
            cursor = parseInt(scanReturn[0]);
            result = result.concat(scanReturn[1]);
        };

        return result;
    }
    
    setCache = async <T>([key, value, ttl]: [string, T, number]) => {
        if (typeof value === "string") {
            await this.client.sendCommand([
                "SET", key, value, "EX", ttl.toString()
            ]);
            return value as T;
        }
        else throw new Error("Unsupported type of value."); // 임시
    }

    deleteCache = (key: string) => Promise.resolve(true);

    getValue = (key: string) => Promise.resolve("value1");

    /**
     * ### redis key prefix 제거
     * 문자열에서 : 를 찾아서 제일 마지막에 있는 : 를 기준으로 : 포함 앞에 있는 문자열을 제거한 문자열 반환.
     */
    static getKeyBody = (key: string) => key.slice(key.lastIndexOf(":")+1);

}