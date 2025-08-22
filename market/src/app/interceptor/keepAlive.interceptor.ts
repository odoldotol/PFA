import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from 'express';
import { Loggable } from "src/logger";

@Injectable()
export class KeepAliveInterceptor
  extends Loggable
  implements NestInterceptor
{
  private keepAlive: boolean = true;

  constructor() {
    super();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    if (this.keepAlive === false) {
      context.switchToHttp().getResponse<Response>().set('Connection', 'close');
    };
    return next.handle()
  }

  public disableKeepAlive() {
    this.logger.log('Disable keepAlive');
    this.keepAlive = false;
  }

}
