import {
  Catch,
  RequestTimeoutException,
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(RequestTimeoutException)
export class TimeoutExceptionFilter
  extends SkillExceptionFilter<RequestTimeoutException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  // ovveride catch
}
