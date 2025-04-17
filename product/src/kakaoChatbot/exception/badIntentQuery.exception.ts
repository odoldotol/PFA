import { BadRequestException } from "@nestjs/common";
import { InquireQuery } from "src/common/interface";

export class BadIntentQueryException
  extends BadRequestException
{
  constructor(query: InquireQuery) {
    super({
      message: 'Bad intent query',
      query,
    });
  }
}
