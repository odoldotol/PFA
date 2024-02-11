import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisModel } from "../interface";

// Todo: Refac
export class SchemaService
  implements OnModuleInit
{
  private readonly schemaName: string;

  constructor(
    private readonly redisSrv: RedisService,
    private readonly redisModel: RedisModel,
  ) {
    this.schemaName = redisModel.schema.name.toLowerCase();
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

  get constructorClass() { // 임시
    return this.redisModel.schema;
  }

}
