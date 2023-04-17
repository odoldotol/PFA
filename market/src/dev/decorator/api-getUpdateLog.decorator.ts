import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

export function Api_getUpdateLog() {
  return applyDecorators(
    ApiOperation({
        summary: 'Get Update Log',
        description: '최근 업데이트 로그를 요청합니다.',
        externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }}),
    ApiQuery({ name: 'ISO_Code', required: false, description: 'Exchange ISO_Code. 주어지지 않으면 모든 거래소에 대해 검색합니다.', type: 'string' }),
    ApiQuery({ name: 'limit', required: false, description: '로그의 수량제한. 주어지지 않으면 5개', type: 'number' }));
}