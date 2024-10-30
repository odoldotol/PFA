import {
  ArgumentsHost,
  Catch,
  Logger
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { SkillExceptionFilter } from "./skillException.filter";

@Catch()
export class UnexpectedExceptionFilter
  extends SkillExceptionFilter
{
  private readonly logger = new Logger(UnexpectedExceptionFilter.name);

  constructor(
    skillResponseSrv: SkillResponseService,
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
