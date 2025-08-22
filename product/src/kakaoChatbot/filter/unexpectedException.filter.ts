import {
  Catch
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from "./skillException.filter";

@Catch()
export class UnexpectedExceptionFilter
  extends SkillExceptionFilter
{
  constructor(
    skillResponseSrv: SkillResponseService,
  ) {
    super(skillResponseSrv);

    this.logOn();
  }
}
