import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import {
  RedisCache,
  RedisCacheFactory,
  RedisModel
} from "./interface";
import {
  completeAssign,
  isType
} from "src/common/util";

/**
 * @todo todo 문서 참고
 */
export class SchemaService<T>
  implements OnModuleInit
{
  private readonly schemaName: string;

  constructor(
    private readonly redisSrv: RedisService<T>,
    private readonly redisModel: RedisModel<T>,
  ) {
    if (!isType(redisModel.entity)) {
      throw new Error("Invalid RedisModel schema");
    }

    this.schemaName = redisModel.entity.name.toLowerCase();
  }

  onModuleInit() {
    this.redisSrv.addModel(this.schemaName, this.redisModel);
  }

  get KEY_PREFIX(): string {
    return this.schemaName;
  }

  get TTL(): number | null {
    return this.redisModel.ttl || null;
  }

  /**
   * #### entity 의 prototype 속성 확장.
   * - entity.prototype 에 RedisSchemaCache.prototype 을 assign 함. (이떄, prototype 속성에 repository 또한 추가)
   * - RedisCacheFactory 를 생성/반환.
   */
  public createRedisCacheFactory(
    repository: RedisRepository<T>
  ): RedisCacheFactory<T> {
    completeAssign(
      this.redisModel.entity.prototype,
      [
        RedisSchemaCache.prototype,
        { repository }
      ],
      {
        blacklist: ['constructor'],
        onlyEnumerable: false
      }
    );

    return (
      keyBody: string,
      value: T
    ): RedisCache<T> => {
      return Object.assign(
        new this.redisModel.entity(value) as RedisCache<T>,
        { keyBody }
      ) as RedisCache<T>
    };
  }

}

/**
 * 클래스의 프로토타입을 이용하는게 직관적이어서, 단지 프로토타입만을 이용하지만 클래스를 정의하고있음.
 * @todo todo 문서 참고
 */
export abstract class RedisSchemaCache<T> {

  constructor(
    private readonly repository: RedisRepository<T>,
    private readonly keyBody: string,
  ) {}

  public get data(): T {
    if (this.isThisPrimitive()) {
      return this.valueOf() as T;
    } else {
      return completeAssign({}, [ this ], { blacklist: ['keyBody'] }) as T;
    }
  }

  public async save(): Promise<void> {
    await this.repository.updateOrCreateOne(this.keyBody, this.data);
  }

  public delete(): Promise<boolean> {
    return this.repository.deleteOne(this.keyBody);
  }

  public count(): Promise<number> {
    return this.repository.count(this.keyBody);
  }

  public getCount(): Promise<number> {
    return this.repository.getCount(this.keyBody);
  }

  public resetCount(): Promise<boolean> {
    return this.repository.resetCount(this.keyBody);
  }

  /**
   * [객체 비교에 사용하지말것. 아직 구현하지 않음.]
   * @todo 객체 비교 임시로 JSON.stringify 이용하고있음. 객체 비교시 더 믿을수 있는 로직 쓰기, 편하게 라이브러리 쓰자
   */
  public isEqualTo(value: T & Object): boolean {
    if (this.isThisPrimitive()) {
      return this.valueOf() === value.valueOf();
    } else {
      return JSON.stringify(this) === JSON.stringify(value);
    }
  }

  /**
   * redis 모듈이 다른 원시타입을 이용함에 따라 수정 필요. (String 말고 사용 안해봄)
   */
  private isThisPrimitive(): boolean {
    return this instanceof String
      || this instanceof Number;
  }

}
