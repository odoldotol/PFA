import {
  Catch,
  ArgumentsHost,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';

// Todo: catch custom exception(NotFoundTickerException)
@Catch(NotFoundException)
export class NotFoundExceptionFilter
  extends SkillExceptionFilter<NotFoundException>
{
  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  override catch(
    exception: NotFoundException, // Todo: custom(NotFoundTickerException)
    host: ArgumentsHost
  ) {
    this.respondNotFoundTickerAssetInquiry(
      host.switchToHttp().getResponse<Response>(),
      exception
    );
  }
}