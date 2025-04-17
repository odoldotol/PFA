import {
  Catch,
  Logger
} from '@nestjs/common';
import { TooLongQueryException } from '../exception';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';

@Catch(TooLongQueryException)
export class TooLongQueryExceptionFilter
  extends SkillExceptionFilter<TooLongQueryException>
{
  protected override readonly logger = new Logger(TooLongQueryExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    _exception: TooLongQueryException
  ): SkillResponse {
    return this.skillResponseSrv.tooLongQueryError();
  }

}
