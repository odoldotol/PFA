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
      let
      skillPayload,
      exceptionStatus,
      exceptionResponse;

      try {
        skillPayload = JSON.stringify(request.body);
      } catch (e) {
        skillPayload = request.body;
      }

      try {
        exceptionStatus = exception["status"];
      } catch (e) {
        exceptionStatus = null;
      }

      try {
        exceptionResponse = JSON.stringify(exception["response"]);
      } catch (e) {
        exceptionResponse = exception["response"];
      }

      this.logger.error(
        exception.message,
        exception.stack,
        `SkillPayload: ${skillPayload}
ExceptionStatus: ${exceptionStatus}
ExceptionResponse: ${exceptionResponse}`
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
