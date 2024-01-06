import { ConfigurableModuleBuilder } from "@nestjs/common";
import { TaskQueueModuleOptions } from "./interface";

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE
} = new ConfigurableModuleBuilder<TaskQueueModuleOptions>().build();