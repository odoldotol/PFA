import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

export function Api_createConfigExchange() {
  return applyDecorators(
    ApiTags('Config'),
    ApiOperation({ summary: 'Create Config Exchange', description: 'Exchange 설정 데이터를 생성합니다.' }));
}