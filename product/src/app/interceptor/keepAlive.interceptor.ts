import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Response } from 'express';

@Injectable()
export class KeepAliveInterceptor implements NestInterceptor {

  private keepAlive: boolean = true;
  private readonly logger = new Logger("KeepAliveInterceptor");

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
