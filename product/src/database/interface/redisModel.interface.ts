export type RedisModel<T> = {
  schema: T & Function // temp
  ttl?: number
};