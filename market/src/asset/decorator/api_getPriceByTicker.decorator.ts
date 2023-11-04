import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ResponseGetPriceByTicker } from '../response/getPriceByTicker.response';

export function Api_getPriceByTicker() {
  return applyDecorators(
    ApiOperation({ summary: 'Get Price By ticker', description: 'ticker로 해당 Asset의 가격을 조회합니다.' }),
    ApiParam({ name: 'ticker', description: '조회할 항목 ticker', example: 'AAPL' }),
    ApiOkResponse({ description: 'Price 조회 정보가 담긴 객체', type: ResponseGetPriceByTicker }));
}