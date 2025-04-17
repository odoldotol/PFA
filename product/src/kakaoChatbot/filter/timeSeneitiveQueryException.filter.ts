import { Catch } from '@nestjs/common';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';
import { TimeSensitiveQueryException } from '../exception';

@Catch(TimeSensitiveQueryException)
export class TimeSensitiveQueryExceptionFilter
  extends SkillExceptionFilter<TimeSensitiveQueryException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    exception: TimeSensitiveQueryException
  ): SkillResponse {
    return this.skillResponseSrv.timeSensitiveQueryError(
      exception,
      (exception.getResponse() as any).query
    )
  }

}
