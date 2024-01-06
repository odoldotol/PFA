import { Module } from "@nestjs/common";
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN
} from "./taskQueue.module-definition";
import { TaskQueueService } from "./taskQueue.service";
import { TaskQueueModuleOptions } from "./interface";

@Module({
  providers: [{
    provide: TaskQueueService,
    useFactory: (options: TaskQueueModuleOptions) => new TaskQueueService(options),
    inject: [MODULE_OPTIONS_TOKEN],
  }],
  exports: [TaskQueueService]
})
export class TaskQueueModule extends ConfigurableModuleClass {
  /* nestjs 에서 제공하는 Async 방식의 모듈을 따르게 되면
  custom provider 를 통해 사용할 수 있는 options 외의 다른 데이터를 사용하기 어렵다.

  예를들어 만약 어떤 Provider 의 InjectionToken 을 동적으로 생성하고 싶고,
  생성시 사용할 데이터를 registerAsync 매서드의 인자로 받고 싶을 수 있지만,
  이는 일반적인 방법으로는 불가능해지는것 같다.
  (물론 registerAsync 매서드를 통해 동적으로 InjectionToken 을 커스텀할 필요가 있는 상황이 없을것같다)

  똥같은 방법이지만, 간단하게 ts-ignore 를 쓰고 데이터를 넘기거나,
  의도와 다른 사용이지만, provideInjectionTokensFrom 로 사용할 데이터를 넣은 Fake provider 를 넘긴다던가 할 수 있음.
  물론 모듈에 필요한 로직을 확장해야함.
  확장 Ref: https://docs.nestjs.com/fundamentals/dynamic-modules#extending-auto-generated-methods */
}
