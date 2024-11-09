import {
  Catch,
  Logger
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from "./skillException.filter";

@Catch()
export class UnexpectedExceptionFilter
  extends SkillExceptionFilter
{
  protected override readonly logger = new Logger(UnexpectedExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService,
  ) {
    super(skillResponseSrv);

    this.logOn();
  }
}
