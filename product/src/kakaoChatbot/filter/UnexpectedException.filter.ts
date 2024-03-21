import {
  ArgumentsHost,
  Catch,
  Logger
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { Request } from 'express';
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
    this.logger.error(
      exception.message,
      exception.stack,
      `SkillPayload: ${JSON.stringify(host.switchToHttp().getRequest<Request>().body)}\nExceptionStatus: ${exception["status"]}`
    );

    super.catch(exception, host);
  }
}
