import { RedisService } from "./redis.service";
import { SchemaService } from "./schema.service";
import { joinColon } from "src/common/util";
import { COUNT } from "./const";
import * as F from "@fxts/core";

/**
 * @todo Refac
 * @todo CRUD 비동기작업 일괄처리 및 문제되는 동시성 해결?
 */
export class Repository<T> {
  constructor(
    private readonly redisSrv: RedisService<T>,
    private readonly schemaSrv: SchemaService<T>,
  ) {}

  public async createOne(
    keyBody: string,
    value: T
  ): Promise<T> {
    return this.valueFactory(await this.redisSrv.setOne(
      this.makeKey(keyBody),
      value,
      { expireSec: this.schemaSrv.TTL, ifNotExist: true }
    ));
  }

  public async updateOrCreateOne(
    keyBody: string,
    value: T
  ): Promise<T> {
    return this.valueFactory(await this.redisSrv.setOne(
      this.makeKey(keyBody),
      value,
      { expireSec: this.schemaSrv.TTL }
    ));
  }

  public async findOne(keyBody: string): Promise<T | null> {
    const result = await this.redisSrv.getOne(this.makeKey(keyBody));
    if (result === null) {
      return null;
    } else {
      return this.valueFactory(result);
    }
  }

  public async updateOne(
    keyBody: string,
    update: Partial<T>
  ): Promise<T> {
    const value = await this.findOne(keyBody);
    if (value === null) {
      throw new Error(`UpdateOne Error: Key not found | key: ${keyBody}`);
    } else {
      return this.valueFactory(await this.redisSrv.setOne(
        this.makeKey(keyBody),
        this.updateValue(update, value),
        { expireSec: this.schemaSrv.TTL, ifExist: true }
      ));
    }
  }

  public async deleteOne(keyBody: string): Promise<boolean> {
    return await this.redisSrv.delete(this.makeKey(keyBody)) === 1;
  }

  /**
   * Deprecated
   * 일단은 사용하지 말고 findOne, deleteOne 사용하자
   */
  public async getAndDeleteOne(keyBody: string): Promise<T> {
    return F.pipe(
      this.redisSrv.getAndDeleteOne(this.makeKey(keyBody)),
      this.valueFactory.bind(this)
    );
  }

  public count(keyBody: string): Promise<number> {
    return this.redisSrv.count(this.makeKey(keyBody, COUNT));
  }

  public async getCount(keyBody: string): Promise<number> {
    return await (this.findOne(this.addSuffixOnKey(keyBody, COUNT)) as Promise<number | null>) ?? 0;
  }

  public resetCount(keyBody: string): Promise<boolean> {
    return this.deleteOne(this.addSuffixOnKey(keyBody, COUNT));
  }

  // /**
  //  * @todo 트렌젝션으로 scan 과 mget 쓰는게 안전하고 효율적이겠지?
  //  * - key: keyBody
  //  */
  // public async getAllKeyValueMap() {
  //   return new Map(await F.pipe(
  //     this.redisSrv.getAllKeys(this.schemaSrv.KEY_PREFIX),
  //     F.map(this.getKeyBody), F.toAsync,
  //     F.map(this.getKeyValueSet.bind(this)), F.toArray
  //   ));
  // }

  private updateValue(
    update: Partial<T>,
    v: T
  ): T {
    if (v instanceof Object) {
      if (typeof v.valueOf() === "object") {
        return Object.assign(v, update);
      } else {
        return update as T;
      }
    }

    // never
    throw new Error("[Never]UpdateOne Error: Invalid value type");
  }

  // private async getKeyValueSet(keyBody: string) {
  //   return [keyBody, await this.findOne(keyBody)] as [string, T | null];
  // }

  private valueFactory(v: T): T {
    return new this.schemaSrv.constructorClass(v); // 임시
  }

  // Todo: 키 타입(프리픽스s+키바디), 키 프리픽스 타입(string+";"), 키 바디 타입(':' 있으면 안됨) 만들기
  private makeKey(
    keyBody: string,
    ...suffix: string[]
  ): string {
    return joinColon(this.schemaSrv.KEY_PREFIX, keyBody, ...suffix);
  }

  private addSuffixOnKey(
    keyBody: string,
    suffix1: string,
    ...suffix: string[]
  ): string {
    return joinColon(keyBody, suffix1, ...suffix);
  }

  /**
   * ### key prefix 제거
   * 문자열에서 : 를 찾아서 제일 마지막에 있는 : 를 기준으로 : 포함 앞에 있는 문자열을 제거한 문자열 반환.
   */
  // private getKeyBody(key: string) {
  //   return key.slice(key.lastIndexOf(":") + 1);
  // }

}
