import {
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';
import { InvalidTickerException } from 'src/common/exception';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';

@Catch(InvalidTickerException)
export class InvalidTickerExceptionFilter
  extends SkillExceptionFilter<InvalidTickerException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  override catch(
    exception: InvalidTickerException,
    host: ArgumentsHost
  ) {
    this.respondInvalidTicker(
      host.switchToHttp().getResponse<Response>(),
      exception
    );
  }
}
