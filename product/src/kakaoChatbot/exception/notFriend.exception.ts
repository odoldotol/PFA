import { ForbiddenException } from "@nestjs/common";

/**
 * @todo 구현
 */
export class NotFriendException
  extends ForbiddenException
{
  constructor() {
    super('Not friend');
  }
}