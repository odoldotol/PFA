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
    
    /**
     * 리턴타입을 T 로 추론하고 있지만, JSON 변환에 의해 object 내부 함수가 사라지는 등의 차이가 있음에 주의.
     */
    setAsJson = async <T>([key, value, ttl]: [string, T, number]) => {

        if (typeof value === "string") {}
        else if (typeof value === "number" && Number.isFinite(value)) {}
        else if (typeof value === "object" && value !== null) {}
        else return null;

        const valueAsJson = JSON.stringify(value);
        await this.client.sendCommand([
            "SET", key, valueAsJson, "EX", ttl.toString()
        ]);
        return JSON.parse(valueAsJson) as T;
    }

    /**
     * Todo: 왜 JSON.parse(null) 이 SyntaxError 가 나지 않을까?
     */
    deleteOne = async (key: string) => JSON.parse(await this.client.sendCommand([
        "GETDEL", key
    ]));

    getValue = (key: string) => Promise.resolve("value1");

    /**
     * ### redis key prefix 제거
     * 문자열에서 : 를 찾아서 제일 마지막에 있는 : 를 기준으로 : 포함 앞에 있는 문자열을 제거한 문자열 반환.
     */
    static getKeyBody = (key: string) => key.slice(key.lastIndexOf(":")+1);

}