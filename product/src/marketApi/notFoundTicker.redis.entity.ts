/**
 * constructor 정의하지 않아야함. RedisEntity decorator 활용하기
 * @todo src/database/redis/todo 문서 참고
 */
export class NotFoundTickerRedisEntity
{
  constructor(value: object) {
    Object.assign(this, value);
  }

}
