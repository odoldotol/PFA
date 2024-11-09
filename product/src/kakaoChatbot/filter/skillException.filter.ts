import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { Response } from 'express';
import { SkillResponse } from "../skillResponse/v2";
import * as F from '@fxts/core';

@Catch()
export abstract class SkillExceptionFilter<T = any>
  implements ExceptionFilter<T>
{
  protected readonly logger = new Logger(SkillExceptionFilter.name);
  private logFlag = false;

  constructor(
    protected readonly skillResponseSrv: SkillResponseService,
  ) {}

  catch(
    exception: T,
    host: ArgumentsHost
  ): void {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();

    this.log(exception, request);

    F.pipe(
      response,
      this.everythingIsOk,
      this.sendSkillResponse.bind(this, exception)
    );
  }

  protected logOn(): void {
    this.logFlag = true;
  }

  protected getBody(
    exception: T,
  ): SkillResponse {
    return this.skillResponseSrv.unexpectedError(exception);
  }

  private log(
    exception: any,
    request: Request,
  ): void {
    if (
      this.logFlag === true &&
      process.env["NODE_ENV"] !== "test" // jest set 'NODE_ENV' to 'test' if it's not already set to something else.
    ) {
      this.logger.error(
        exception.message,
        exception.stack,
        `SkillPayload: ${JSON.stringify(request.body)}\nExceptionStatus: ${exception["status"]}\nExceptionResponse: ${JSON.stringify(exception["response"])}`
      );
    }
  }

  /**
   * 200 번대 이어야 카카오톡 챗봇 응답이 정상출력됨.
   */
  private everythingIsOk(
    res: Response
  ): Response {
    return res.status(HttpStatus.OK)
  }

  private sendSkillResponse(
    exception: T,
    res: Response
  ): void {
    res.json(this.getBody(exception));
  }

}
