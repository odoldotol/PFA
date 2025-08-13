import {
  Injectable,
  NestMiddleware
} from '@nestjs/common';
import {
  Request,
  Response,
  NextFunction
} from 'express';
import { ConsoleLogger } from 'src/logger';
import { getTraceId } from 'src/openTelemetry';

@Injectable()
export class HttpLoggerMiddleware
  implements NestMiddleware
{
  private readonly logger = new ConsoleLogger("HttpLogger");

  use(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const reqTime = Date.now();

    res.on('finish', this.log.bind(this, reqTime, req, res));
    
    next();
  }

  private log(
    reqTime: number,
    req: Request,
    res: Response,
  ): void {
    const
    { method, originalUrl } = req,
    { statusCode } = res,
    traceId = getTraceId();

    if (
      originalUrl === '/health' &&
      method === 'GET' &&
      (statusCode === 200 || statusCode === 304)
    ) {
      return;
    }

    const responseTime = Date.now();
    const duration = responseTime - reqTime;

    this.logger.log(`${statusCode} | ${(duration + 'ms').padStart(7)} | ${(traceId || 'N/A').padEnd(32)} | ${method.padStart(7)} | ${originalUrl}`);
  }

}
