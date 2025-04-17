import { BadRequestException } from "@nestjs/common";

/**
 * @todo 구현
 */
export class InvalidQueryException
  extends BadRequestException
{
  constructor() {
    super('Invalid query');
  }
}
