import {
  Catch,
  Logger,
  RequestTimeoutException,
} from '@nestjs/common';
import { Request } from 'express';
import { SkillResponseService } from '../skillResponse.service';
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';
import { SkillPayload } from '../interface/skillPayload.interface';

@Catch(RequestTimeoutException)
export class InquireTimeoutExceptionFilter
  extends SkillExceptionFilter<RequestTimeoutException>
{
  protected override readonly logger = new Logger(InquireTimeoutExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    exception: RequestTimeoutException,
    request: Request
  ): SkillResponse {
    const query
    = (request.body as SkillPayload).action.clientExtra['query']
    || (request.body as SkillPayload).userRequest.utterance;

    if (query === undefined) {
      return super.getBody(exception, request);
    }

    return this.skillResponseSrv.inquireTimeoutError(
      query,
      exception
    );
  }

}
