import {
  ArgumentsHost,
  Catch,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { Request, Response } from 'express';
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class UnexpectedExceptionsFilter
  extends BaseExceptionFilter
{
  private readonly logger = new Logger(UnexpectedExceptionsFilter.name);

  constructor(
    private readonly skillResponseSrv: SkillResponseService,
  ) {
    super();
  }

  override catch(exception: any, host: ArgumentsHost) {
    if (
      exception.status === undefined ||
      exception.status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.status;

      this.logger.error(
        exception.message,
        exception.stack,
        `SkillPayload: ${JSON.stringify(request.body)}\nExceptionStatus: ${status}`
      );
        
      response
      .status(HttpStatus.OK)
      .json(this.skillResponseSrv.unexpectedError());
    } else {
      super.catch(exception, host);
    }
  }
}
