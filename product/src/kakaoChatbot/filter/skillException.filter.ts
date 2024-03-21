import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
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
