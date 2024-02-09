import { OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisModel } from "../interface";

// Todo: Refac
export class SchemaService
  implements OnModuleInit, OnApplicationBootstrap
{
  public readonly KEY_PREFIX: string;

  constructor(
    private readonly redisSrv: RedisService,
    private readonly redisModel: RedisModel,
  ) {
    this.KEY_PREFIX = redisModel.schema.name.toLowerCase();
  }

  // onModuleInit, onApplicationBootstrap 두개의 라이프사이클 훅으로 중복 체크
  async onModuleInit() {
    if ((await this.redisSrv.getOne(this.KEY_PREFIX)) === 1) {
      throw new Error(`Duplicate Schema Key: ${this.KEY_PREFIX}`);
    } else {
      await this.redisSrv.setOne([this.KEY_PREFIX, 1]);
    }
  }

  async onApplicationBootstrap() {
    await this.redisSrv.setOne([this.KEY_PREFIX, 0]);
  }

  get TTL(): number | null {
    return this.redisModel.ttl || null;
  }

  get constructorClass() { // 임시
    return this.redisModel.schema;
  }

}
