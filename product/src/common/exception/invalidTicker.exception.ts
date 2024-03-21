import { BadRequestException } from "@nestjs/common";

/**
 * @todo 구현
 */
export class InvalidTickerException
  extends BadRequestException
{
  constructor() {
    super('Invalid ticker');
  }
}