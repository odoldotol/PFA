import {
  Catch,
  Logger
} from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import { SkillExceptionFilter } from "./skillException.filter";
import { SkillResponseService } from "../skillResponse.service";
import { SkillResponse } from "../skillResponse/v2";

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter
  extends SkillExceptionFilter<ThrottlerException>
{
  protected override readonly logger = new Logger(ThrottlerExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService
  ) {
    super(skillResponseSrv);
  }

  protected override getBody(
    _exception: ThrottlerException
  ): SkillResponse {
    return this.skillResponseSrv.throttlerError();
  }

}
