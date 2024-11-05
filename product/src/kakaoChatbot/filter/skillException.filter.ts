import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { SkillResponseService } from "../skillResponse.service";
import { Response } from 'express';
import { InvalidTickerException } from "src/common/exception";

@Catch()
export abstract class SkillExceptionFilter<T = any>
  implements ExceptionFilter<T>
{
  constructor(
    private readonly skillResponseSrv: SkillResponseService,
  ) {}

  catch(
    exception: T,
    host: ArgumentsHost
  ) {
    this.respondUnexpected(
      host.switchToHttp().getResponse<Response>(),
      exception
    );
  }

  protected logError(
    exception: any,
    host: ArgumentsHost,
    logger: Logger
  ) {
    if (process.env["NODE_ENV"] !== "test") { // jest set 'NODE_ENV' to 'test' if it's not already set to something else.
      logger.error(
        exception.message,
        exception.stack,
        `SkillPayload: ${JSON.stringify(host.switchToHttp().getRequest<Request>().body)}\nExceptionStatus: ${exception["status"]}`
      );
      exception.response && logger.verbose(`Exception Rsponse: ${exception.response}`);
    }
  }

  protected respondUnexpected(
    res: Response,
    exception: T
  ): Response {
    return this.everythingIsOk(res)
    .json(this.skillResponseSrv.unexpectedError(exception));
  }

  protected respondTimeout(
    res: Response,
    exception: T
  ): Response {
    return this.everythingIsOk(res)
    .json(this.skillResponseSrv.timeoutError(exception));
  }

  protected respondInvalidTicker(
    res: Response,
    exception: InvalidTickerException
  ): Response {
    return this.everythingIsOk(res)
    .json(this.skillResponseSrv.invalidTickerError(exception));
  }

  // Todo: Refac
  protected respondNotFoundTickerAssetInquiry(
    res: Response,
    exception: HttpException // Todo: custom(NotFoundTickerException)
  ): Response {
    return this.everythingIsOk(res)
    .json(this.skillResponseSrv.notFoundTickerAssetInquiry(
      (exception.getResponse() as any).ticker, // Todo: 리팩터링 after 리팩터링(market - product 로 이어지는 부분)
      exception
    ));
  }

  private everythingIsOk(
    res: Response
  ): Response {
    return res.status(HttpStatus.OK)
  }
}
