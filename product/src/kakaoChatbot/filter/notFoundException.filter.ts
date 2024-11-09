import {
  Catch,
  NotFoundException
} from '@nestjs/common';
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from './skillException.filter';
import { SkillResponse } from '../skillResponse/v2';

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

  protected override getBody(
    exception: NotFoundException
  ): SkillResponse {
    return this.skillResponseSrv.notFoundTickerAssetInquiry(
      (exception.getResponse() as any).ticker, // Todo: 리팩터링 after 리팩터링(market - product 로 이어지는 부분)
      exception
    )
  }

}
