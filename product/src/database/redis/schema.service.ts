import { OnModuleInit } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisModel } from "../interface";
import { isType } from "src/common/util";

// Todo: Refac
export class SchemaService<T>
  implements OnModuleInit
{
  private readonly schemaName: string;

  constructor(
    private readonly redisSrv: RedisService<T>,
    private readonly redisModel: RedisModel<T>,
  ) {
    if (!isType(redisModel.schema)) {
      throw new Error("Invalid RedisModel schema");
    }

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
    return this.redisModel.schema as { new(arg: T): T };
  }

}
