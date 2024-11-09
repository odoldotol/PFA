import {
  Catch,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter
  extends SkillExceptionFilter<ForbiddenException>
{
  protected override readonly logger = new Logger(ForbiddenExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);

    this.logOn();
  }
}
