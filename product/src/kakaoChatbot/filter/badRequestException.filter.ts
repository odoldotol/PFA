import {
  Catch,
  BadRequestException,
  ArgumentsHost,
  Logger
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(BadRequestException)
export class BadRequestExceptionFilter
  extends SkillExceptionFilter<BadRequestException>
{

  private readonly logger = new Logger(BadRequestExceptionFilter.name);

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
