import {
  Catch,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(BadRequestException)
export class BadRequestExceptionFilter
  extends SkillExceptionFilter<BadRequestException>
{
  protected override readonly logger = new Logger(BadRequestExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);

    this.logOn();
  }
}
