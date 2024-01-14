import { Injectable } from "@nestjs/common";
import { ConnectionService } from "./connect.service";
import { InMemoryStoreService } from "../interface";
import { RedisServiceI, SetOptions } from "./interface";

@Injectable()
export class RedisService
  implements InMemoryStoreService, RedisServiceI
{
  // 비동기 프로바이더로 connection 에서 연결완료하고 생성자 파라미터로 ConnectionService 대신 client 받을까?
  private readonly client = this.connectionSrv.client;

  constructor(
    private readonly connectionSrv: ConnectionService
  ) {}

  /**
   * ### Todo: Refac
   * - 더 작은 함수로 나누기
   * - while 문 제거하기(재귀적으로 구현하거나 F.range 쓰거나?)
   * - result, cursor 변수선언을 제거하기
   */
  public async getAllKeys(prefix: string = "") {
    let result: string[] = [];
    let cursor: number | true = true;
    while (cursor) {
      cursor === true ? cursor = 0 : cursor;
      const scanReturn = await this.client.sendCommand([
        "SCAN", `${cursor}`, "MATCH", prefix + "*", "COUNT", "100"
      ]) as [string, string[]];
      cursor = parseInt(scanReturn[0]);
      result = result.concat(scanReturn[1]);
    };
    return result;
  }

  /**
   * 리턴타입을 T 로 추론하고 있지만, JSON 변환에 의해 object 내부 함수가 사라지는 등의 차이가 있음에 주의.
   * ### Todo: Refac
   * - 더 작은 함수로 나누기
   * - 조건문 제거하기
   */
  public async setOne<T>([key, value]: [string, T], setOptions?: SetOptions) {
    if (typeof value === "string") { }
    else if (typeof value === "number" && Number.isFinite(value)) { }
    else if (typeof value === "object" && value !== null) { }
    else return null;

    const valueAsJson = JSON.stringify(value);
    const command = ["SET", key, valueAsJson];

    if (setOptions) {
      if (setOptions.expireSec) command.push("EX", setOptions.expireSec.toString());
      if (setOptions.ifNotExist) command.push("NX");
      else if (setOptions.ifExist) command.push("XX");
    };

    return await this.client.sendCommand(command) === null ? null : JSON.parse(valueAsJson) as T;
  }

  /**
   * Todo: 왜 JSON.parse(null) 이 SyntaxError 가 나지 않을까?
   */
  public async deleteOne(key: string) {
    return JSON.parse(await this.client.sendCommand([
      "GETDEL", key
    ]));
  }

  public async getOne(key: string) {
    return JSON.parse(await this.client.sendCommand([
      "GET", key
    ]));
  }

}
