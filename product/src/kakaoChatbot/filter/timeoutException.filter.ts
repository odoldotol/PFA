import {
  Catch,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(RequestTimeoutException)
export class TimeoutExceptionFilter
  extends SkillExceptionFilter<RequestTimeoutException>
{
  protected override readonly logger = new Logger(TimeoutExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);

    this.logOn();
  }
}
