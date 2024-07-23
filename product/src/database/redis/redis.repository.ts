import { RedisService } from "./redis.service";
import { SchemaService } from "./schema.service";
import { COUNT } from "./const";
import {
  RedisCache,
  RedisCacheFactory
} from "./interface";
import { joinColon } from "src/common/util";
import * as F from "@fxts/core";

/**
 * @todo CRUD 비동기작업 일괄처리 및 문제되는 동시성 해결? (Map<KeyBody, Promise<any>> 를 이용?)
 */
export class RedisRepository<T>
{
  private readonly redisCacheFactory: RedisCacheFactory<T>;

  constructor(
    private readonly redisSrv: RedisService<T>,
    private readonly schemaSrv: SchemaService<T>,
  ) {
    this.redisCacheFactory = this.schemaSrv.createRedisCacheFactory(this);
  }

  public async createOne(
    keyBody: string,
    value: T
  ): Promise<RedisCache<T>> {
    return this.redisCacheFactory(
      keyBody,
      await this.redisSrv.setOne(
        this.makeKey(keyBody),
        value,
        { expireSec: this.schemaSrv.TTL, ifNotExist: true }
      )
    );
  }

  public async updateOrCreateOne(
    keyBody: string,
    value: T
  ): Promise<RedisCache<T>> {
    return this.redisCacheFactory(
      keyBody,
      await this.redisSrv.setOne(
        this.makeKey(keyBody),
        value,
        { expireSec: this.schemaSrv.TTL }
      )
    );
  }

  public async findOne(keyBody: string): Promise<RedisCache<T> | null> {
    const result = await this.redisSrv.getOne(this.makeKey(keyBody));
    if (result === null) {
      return null;
    } else {
      return this.redisCacheFactory(keyBody, result);
    }
  }

  /**
   * #### [Deprecated] 매서드 내부에서 두번의 쿼리가 있기때문에 동시성 문제가 발생할 수 있음.
   * - 존재하지 않는 키의 경우 에러던짐
   * 
   * @todo deleteOne, getAndDeleteOne, updateOrCreateOne 에서 findOneAndUpdate 실행중인 keyBody로 호출되면 기다릴 수 있으면 좋겠다?
   */
  public async findOneAndUpdate(
    keyBody: string,
    update: Partial<T>
  ): Promise<RedisCache<T>> {
    const value = await this.redisSrv.getOne(this.makeKey(keyBody));
    if (value === null) {
      throw new Error(`UpdateOne Error: Key not found | key: ${keyBody}`);
    } else {
      return this.redisCacheFactory(
        keyBody,
        await this.redisSrv.setOne(
          this.makeKey(keyBody),
          this.updateValue(update, value),
          { expireSec: this.schemaSrv.TTL, ifExist: true }
        )
      );
    }
  }

  public async deleteOne(keyBody: string): Promise<boolean> {
    return await this.redisSrv.delete(this.makeKey(keyBody)) === 1;
  }

  /**
   * Deprecated
   * 일단은 사용하지 말고 findOne, deleteOne 사용하자
   */
  public async getAndDeleteOne(keyBody: string): Promise<RedisCache<T>> {
    return F.pipe(
      this.redisSrv.getAndDeleteOne(this.makeKey(keyBody)),
      this.redisCacheFactory.bind(null, keyBody)
    );
  }

  public count(keyBody: string): Promise<number> {
    return this.redisSrv.count(this.makeKey(keyBody, COUNT));
  }

  public async getCount(keyBody: string): Promise<number> {
    return await (this.redisSrv.getOne(this.makeKey(keyBody, COUNT)) as Promise<number | null>) ?? 0;
  }

  public resetCount(keyBody: string): Promise<boolean> {
    return this.deleteOne(this.addSuffixOnKey(keyBody, COUNT));
  }

  private updateValue(
    update: Partial<T>,
    v: T
  ): T {
    if (v instanceof Object) {
      return Object.assign(v, update);
    } else {
      return update as T;
    }

    // never
    throw new Error("[Never]UpdateOne Error: Invalid value type");
  }

  private makeKey(
    keyBody: string,
    ...suffix: string[]
  ): string {
    if (keyBody === "") {
      throw new Error("Invalid keyBody");
    }

    return joinColon(this.schemaSrv.KEY_PREFIX, keyBody, ...suffix);
  }

  private addSuffixOnKey(
    keyBody: string,
    suffix1: string,
    ...suffix: string[]
  ): string {
    return joinColon(keyBody, suffix1, ...suffix);
  }

}
