import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

export function Api_inquireAsset() {
  return applyDecorators(
    ApiOperation({ summary: 'inquire Asset By ticker', description: 'ticker로 Asset을 조회합니다.' }),
    ApiParam({ name: 'ticker', description: '조회할 항목 ticker', example: 'AAPL' }),
    ApiOkResponse({ description: 'Asset의 정보가 담긴 객체' }));
}