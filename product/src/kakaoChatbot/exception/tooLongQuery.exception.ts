import { BadRequestException } from "@nestjs/common";

/**
 * @todo 구현
 */
export class TooLongQueryException
  extends BadRequestException
{
  constructor() {
    super('Too long query');
  }
}