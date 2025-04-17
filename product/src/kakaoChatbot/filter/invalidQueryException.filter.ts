import { Catch } from '@nestjs/common';
import { InvalidQueryException } from '../exception';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';

@Catch(InvalidQueryException)
export class InvalidQueryExceptionFilter
  extends SkillExceptionFilter<InvalidQueryException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    _exception: InvalidQueryException
  ): SkillResponse {
    return this.skillResponseSrv.invalidQueryError();
  }

}
