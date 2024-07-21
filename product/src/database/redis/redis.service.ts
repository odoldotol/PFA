import { Inject, Injectable } from "@nestjs/common";
import { RedisClientType } from "redis";
import { REDIS_CLIENT_TOKEN } from "./const";
import { MaximumOneOf } from "src/common/interface";
import { RedisModel } from "./interface";

@Injectable()
// Todo: Refac
export class RedisService<T = any> {

  private readonly modelMap: Map<string, RedisModel<T>> = new Map();

  constructor(
    @Inject(REDIS_CLIENT_TOKEN)
    private readonly client: RedisClientType
  ) {}

  public addModel(
    schemaName: string,
    model: RedisModel<T>
  ): void {
    if (this.modelMap.has(schemaName)) {
      throw new Error(`Duplicate Schema name: ${schemaName}`);
    }
    this.modelMap.set(schemaName, model);
  }

  public async getAllKeys(prefix: string = "") {
    let result: string[] = [];
    let cursor= 0;
    do {
      const scanReturn = await this.client.sendCommand([
        "SCAN", `${cursor}`, "MATCH", prefix + "*", "COUNT", "100"
      ]) as [string, string[]];
      cursor = parseInt(scanReturn[0]);
      result = result.concat(scanReturn[1]);
    } while (cursor !== 0);
    return result;
  }

  /**
   * JSON 이용한 SET 과 리턴
   */
  public async setOne(
    key: string,
    value: T,
    setOptions?: SetOptions
  ): Promise<T> {
    if (
      !(typeof value === "string") &&
      !(typeof value === "number" && Number.isFinite(value)) &&
      !(typeof value === "object" && value !== null)
    ) {
      throw new Error(`Redis SET command Error: Invalid value type | value: ${value}`);
    }

    const valueAsJson = JSON.stringify(value);
    const command = ["SET", key, valueAsJson];

    if (setOptions) {
      if (setOptions.expireSec) {
        command.push("EX", setOptions.expireSec.toString());
      }

      if (setOptions.ifNotExist) {
        command.push("NX");
      } else if (setOptions.ifExist) {
        command.push("XX");
      }
    };

    const result = await this.client.sendCommand(command);

    if (result === "OK") {
      return JSON.parse(valueAsJson) as T;
    } else if (result === null) {
      if (setOptions?.ifNotExist) {
        throw new Error(`Redis SET command Error: Key already exists | key: ${key}`);
      } else if (setOptions?.ifExist) {
        throw new Error(`Redis SET command Error: Key does not exist | key: ${key}`);
      }
    }

    // never
    throw new Error(`[Never]Redis SET command Error | key: ${key} | value: ${value} | setOptions: ${setOptions} | result: ${result}`);
  }

  /**
   * ### Deprecated
   * GETDEL 과 JSON.parse 이용
   * null 반환하는 경우 처리가 깔끔하지 않음 (키의 값의 문자열인 경우에만 쓸모있음)
   */
  public async getAndDeleteOne(key: string): Promise<T> {
    const result = await this.client.sendCommand([
      "GETDEL", key
    ]);

    if (typeof result === "string") {
      return JSON.parse(result) as T;
    } else if (result === null) {
      throw new Error(`Redis GETDEL command Error: The key does not exist or The key's value type is not a string. | key: ${key}`);
    }

    // never
    throw new Error(`[Never]Redis GETDEL command Error | key: ${key} | result: ${result}`);
  }

  /**
   * DEL
   */
  public delete(...keys: string[]): Promise<number> {
    return this.client.sendCommand([
      "DEL", ...keys
    ]);
  }

  /**
   * GET 과 JSON.parse 이용
   */
  public async getOne(key: string): Promise<T | null> {
    const result = await this.client.sendCommand([
      "GET", key
    ]);

    if (typeof result === "string") {
      return JSON.parse(result) as T;
    } else if (result === null) {
      return null;
    }

    // never
    throw new Error(`[Never]Redis GET command Error | key: ${key} | result: ${result}`);
  }

  public count(key: string): Promise<number> {
    return this.client.sendCommand([
      "INCR", key
    ]);
  }

}

type SetTTL = {
  expireSec?: number | null;
};

type SetIf = MaximumOneOf<{
  ifNotExist: true;
  ifExist: true;
}>;

type SetOptions = SetTTL & SetIf;