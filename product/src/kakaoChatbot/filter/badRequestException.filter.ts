import {
  Catch,
  BadRequestException
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(BadRequestException)
export class BadRequestExceptionFilter
  extends SkillExceptionFilter<BadRequestException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  // ovveride catch
}
