import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  RequestTimeoutException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { SkillResponseService } from '../skillResponse.service';

@Catch(RequestTimeoutException)
export class TimeoutExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly skillResponseSrv: SkillResponseService
  ) {}

  catch(
    _exception: RequestTimeoutException,
    host: ArgumentsHost
  ) {
    host.switchToHttp().getResponse<Response>()
    .status(HttpStatus.OK)
    .json(this.skillResponseSrv.timeoutError());
  }
}
