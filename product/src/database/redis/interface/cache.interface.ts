import { RedisSchemaCache } from "../schema.service";

export type RedisCache<T> = T & RedisSchemaCache<T>

export type RedisCacheFactory<T> = (
  keybody: string,
  value: T
) => RedisCache<T>;