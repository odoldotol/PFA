import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";

@Injectable()
export class GlobalInterceptor implements NestInterceptor {

  constructor(
    private readonly interceptor: NestInterceptor
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return this.interceptor.intercept(context, next)
  }

}
