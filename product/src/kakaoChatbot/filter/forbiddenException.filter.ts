import {
  ArgumentsHost,
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
  private readonly logger = new Logger(ForbiddenExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  override catch(
    exception: any,
    host: ArgumentsHost
  ) {
    this.logError(exception, host, this.logger);
    super.catch(exception, host);
  }

}
