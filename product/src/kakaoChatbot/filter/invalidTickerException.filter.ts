import {
  Catch,
} from '@nestjs/common';
import { InvalidTickerException } from 'src/common/exception';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';

@Catch(InvalidTickerException)
export class InvalidTickerExceptionFilter
  extends SkillExceptionFilter<InvalidTickerException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    exception: InvalidTickerException
  ): SkillResponse {
    return this.skillResponseSrv.invalidTickerError(exception);
  }

}
