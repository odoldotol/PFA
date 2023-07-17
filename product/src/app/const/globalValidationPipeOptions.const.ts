import { ValidationPipeOptions } from "@nestjs/common";

export const globalValidationPipeOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};