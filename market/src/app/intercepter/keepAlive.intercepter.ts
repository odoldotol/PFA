import { CallHandler, ExecutionContext, Logger, NestInterceptor } from "@nestjs/common";
import { Response } from 'express';

export class KeepAliveInterceptor implements NestInterceptor {

  private keepAlive: boolean;
  private readonly logger = new Logger("KeepAliveInterceptor");

  constructor(keepAlive?: boolean) {
    this.keepAlive = keepAlive ? keepAlive : true;
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    if (this.keepAlive === false) {
      this.logger.verbose('Disable keepAlive');
      context.switchToHttp().getResponse<Response>().set('Connection', 'close');
    };
    return next.handle()
  }

  public disableKeepAlive() {
    this.keepAlive = false;
  }

}
