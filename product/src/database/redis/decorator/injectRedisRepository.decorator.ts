import { Inject, Type } from "@nestjs/common";
import { REDIS_REPOSITORY_TOKEN_SUFFIX } from "../const";

export const InjectRedisRepository = (
  schema: Type
) => Inject(schema.name + REDIS_REPOSITORY_TOKEN_SUFFIX);