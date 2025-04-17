import { BadRequestException } from "@nestjs/common";
import { InquireQuery } from "src/common/interface";

export class TimeSensitiveQueryException
  extends BadRequestException
{
  constructor(query: InquireQuery) {
    super({
      message: 'Time sensitive query',
      query,
    });
  }
}
