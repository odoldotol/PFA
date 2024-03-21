import {
  Catch,
  ForbiddenException
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(ForbiddenException)
export class ForbiddenExceptionFilter
  extends SkillExceptionFilter<ForbiddenException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  // ovveride catch
}
