import { ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { globalValidationPipeOptions } from "../const";

export const GlobalValidationPipeProvider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe(globalValidationPipeOptions)
};