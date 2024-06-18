import { DynamicModule, Module } from "@nestjs/common";
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from "./taskQueue.module-definition";
import { TaskQueueService } from "./taskQueue.service";
import { TaskQueueModuleOptions } from "./interface";
import { TOKEN_SUFFIX } from "./const/injectionToken.const";

@Module({})
export class TaskQueueModule
  extends ConfigurableModuleClass
{
  static customRegisterAsync(
    token: string,
    options: Parameters<typeof ConfigurableModuleClass.registerAsync>[0]
  ): DynamicModule {
    const taskQueueToken = this.makeToken(token);
    const module = super.registerAsync(options);
    module.providers!.push({ provide: taskQueueToken, useClass: TaskQueueService });
    module.exports = [ taskQueueToken ];
    return module;
  }

  static customRegister(
    token: string,
    options: TaskQueueModuleOptions
  ): DynamicModule {
    const taskQueueToken = this.makeToken(token);
    return {
      module: TaskQueueModule,
      providers: [
        { provide: MODULE_OPTIONS_TOKEN, useValue: options },
        { provide: taskQueueToken, useClass: TaskQueueService }
      ],
      exports: [ taskQueueToken ]
    };
  }

  static registerAsync(
    options: Parameters<typeof ConfigurableModuleClass.registerAsync>[0]
  ): DynamicModule {
    const module = super.registerAsync(options);
    module.providers!.push(TaskQueueService);
    module.exports = [ TaskQueueService ];
    return module;
  }

  static register(
    options: TaskQueueModuleOptions
  ): DynamicModule {
    const module = super.register(options);
    module.providers!.push(TaskQueueService);
    module.exports = [ TaskQueueService ];
    return module;
  }

  private static makeToken(token: string): string {
    return token + TOKEN_SUFFIX;
  }
}
