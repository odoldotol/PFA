import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiCommonResponse() {
  return applyDecorators(
    ApiForbiddenResponse(),
    ApiBadRequestResponse(),
    ApiNotFoundResponse());}