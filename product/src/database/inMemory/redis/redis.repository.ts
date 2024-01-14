import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { InMemorySchema } from "../class/schema.class";
import { InMemoryRepository } from "../interface";
import * as F from "@fxts/core";

@Injectable()
export class RedisRepository<T> implements InMemoryRepository<T> {

  private readonly KEY_PREFIX = this.schema.keyPrefix;
  private readonly TTL = this.schema.ttl;

  constructor(
    private readonly redisSrv: RedisService,
    private readonly schema: InMemorySchema,
  ) {}

  public createOne(keyBody: string, value: T) {
    return F.pipe(
      this.redisSrv.setOne(
        [this.makeKey(keyBody), value],
        { expireSec: this.TTL, ifNotExist: true }
      ),
      this.valueFactory.bind(this)
    );
  }

  public findOne(keyBody: string) {
    return F.pipe(
      this.redisSrv.getOne(this.makeKey(keyBody)),
      this.valueFactory.bind(this)
    );
  }

  // Todo: 함수 추출하기, 조건문 없에기
  public updateOne(keyBody: string, update: Partial<T>) {
    return F.pipe(
      this.findOne(keyBody),
      (v: T | null) => {
        if (v instanceof Object) {
          if (typeof v.valueOf() === "object") return Object.assign(v, update);
          else return update as T;
        } else return null;
      },
      v => v && this.redisSrv.setOne([this.makeKey(keyBody), v], { expireSec: this.TTL, ifExist: true }),
      this.valueFactory.bind(this)
    );
  }

  public deleteOne(keyBody: string) {
    return F.pipe(
      this.redisSrv.deleteOne(this.makeKey(keyBody)),
      this.valueFactory.bind(this)
    );
  }

  /**
   * @todo 트렌젝션으로 scan 과 mget 쓰는게 안전하고 효율적이겠지?
   * - key: keyBody
   */
  public async getAllKeyValueMap() {
    return new Map(await F.pipe(
      this.redisSrv.getAllKeys(this.KEY_PREFIX),
      F.map(this.getKeyBody), F.toAsync,
      F.map(this.getKeyValueSet.bind(this)), F.toArray
    ));
  }

  private async getKeyValueSet(keyBody: string) {
    return [keyBody, await this.findOne(keyBody)] as [string, T | null];
  }

  private valueFactory(v: T | null) {
    return v && new this.schema.constructorClass(v) as T;
  }

  // Todo: 키 타입(프리픽스s+키바디), 키 프리픽스 타입(string+";"), 키 바디 타입(':' 있으면 안됨) 만들기
  private makeKey(keyBody: string) {
    return this.KEY_PREFIX + keyBody;
  }

  /**
   * ### key prefix 제거
   * 문자열에서 : 를 찾아서 제일 마지막에 있는 : 를 기준으로 : 포함 앞에 있는 문자열을 제거한 문자열 반환.
   */
  private getKeyBody(key: string) {
    return key.slice(key.lastIndexOf(":") + 1);
  }

}
