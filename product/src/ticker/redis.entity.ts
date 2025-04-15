import { ModelResponse } from "./interface";

/**
 * constructor 정의하지 않아야함. RedisEntity decorator 활용하기
 * @todo src/database/redis/todo 문서 참고
 */
export class ResponseRedisEntity
  implements ModelResponse
{
  public readonly body: ModelResponse["body"];
  public readonly exceptionCode: ModelResponse["exceptionCode"];

  constructor(value: ModelResponse) {
    this.body = value.body;
    this.exceptionCode = value.exceptionCode;
  }

}
