import { ValidationPipeOptions } from "@nestjs/common";

export default<ValidationPipeOptions> {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
};