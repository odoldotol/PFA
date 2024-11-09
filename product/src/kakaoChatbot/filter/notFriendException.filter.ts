import {
  Catch,
} from '@nestjs/common';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';
import { NotFriendException } from '../exception';


@Catch(NotFriendException)
export class NotFriendExceptionFilter
  extends SkillExceptionFilter<NotFriendException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    exception: NotFriendException
  ) {
    return this.skillResponseSrv.notFriendError(exception);
  }

}