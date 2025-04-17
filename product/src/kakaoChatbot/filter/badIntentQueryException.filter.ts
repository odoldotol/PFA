import { Catch } from '@nestjs/common';
import { BadIntentQueryException } from '../exception';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';

@Catch(BadIntentQueryException)
export class BadIntentQueryExceptionFilter
  extends SkillExceptionFilter<BadIntentQueryException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    exception: BadIntentQueryException
  ): SkillResponse {
    return this.skillResponseSrv.badIntentQueryError(
      exception,
      (exception.getResponse() as any).query
    )
  }

}
