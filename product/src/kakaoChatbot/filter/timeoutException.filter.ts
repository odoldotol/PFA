import {
  ArgumentsHost,
  Catch,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(RequestTimeoutException)
export class TimeoutExceptionFilter
  extends SkillExceptionFilter<RequestTimeoutException>
{

  private readonly logger = new Logger(TimeoutExceptionFilter.name);

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
