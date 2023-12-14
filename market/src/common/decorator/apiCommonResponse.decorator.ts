import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse } from '@nestjs/swagger';

export function ApiCommonResponse() {
  return applyDecorators(
    // ApiForbiddenResponse({ description: '권한이 없음.' }),
    // ApiBadRequestResponse({ description: '잘못된 요청.' }),
    // ApiNotFoundResponse({ description: '요청한 리소스를 찾을 수 없음.' })
  );
}