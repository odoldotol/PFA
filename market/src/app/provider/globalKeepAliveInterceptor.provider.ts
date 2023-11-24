import { APP_INTERCEPTOR } from "@nestjs/core";
import { GlobalInterceptor, KeepAliveInterceptor } from "../interceptor";

export const GlobalKeepAliveInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useFactory: (interceptor: KeepAliveInterceptor) => new GlobalInterceptor(interceptor), // Todo: 이거 왜이럼?
  inject: [ KeepAliveInterceptor ]
};