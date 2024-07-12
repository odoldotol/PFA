import { MarketDate } from 'src/common/interface';

/**
 * constructor 정의하지 않아야함. RedisEntity decorator 활용하기
 * @todo src/database/redis/todo 문서 참고
 */
export class MarketDateRedisEntity
  extends String
{
  constructor(value: MarketDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) === false) {
      throw new Error(`Invalid MarketDate : ${value}`);
    }

    super(value);
  }
}
