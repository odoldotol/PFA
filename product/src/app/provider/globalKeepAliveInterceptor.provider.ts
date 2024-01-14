import { APP_INTERCEPTOR } from "@nestjs/core";
import { KeepAliveInterceptor } from "../interceptor";

/**
 * KeepAliveInterceptor 별개 프로바이더로 등록하고 밖에서 쉽게 접근할 수 있도록 강제하기위해 inject 하도록 강제함.
 */
export const GlobalKeepAliveInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (keepAliveInterceptor: KeepAliveInterceptor) => keepAliveInterceptor,
  inject: [KeepAliveInterceptor]
};