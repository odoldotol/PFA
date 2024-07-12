import { Inject } from "@nestjs/common";

export const InjectRedisRepository = (
  schema: any //
) => Inject(schema.name + "REDIS_REPOSITORY_TOKEN_SUFFIX");