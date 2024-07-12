import { Type } from "@nestjs/common";

export type RedisModel<T> = {
  entity: Type<T>;
  ttl?: number;
};