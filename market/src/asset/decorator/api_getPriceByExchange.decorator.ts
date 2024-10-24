import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

export function Api_getPriceByExchange() {
  return applyDecorators(
    ApiOperation({
        summary: 'Get Price By Exchange ISO_Code',
        description: '거래소 ISO_Code로 해당 거래소의 Assets의 가격을 조회합니다. 거래소에 맞게 최신화된 Assets만 조회됩니다.',
        externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }}),
    ApiParam({ name: 'ISO_Code', description: 'Exchange ISO_Code', example: 'XNYS' }),
    ApiOkResponse({ description: '[Symbol, Price, Currency] 의 배열', schema: { example: [['AAPL', 160, 'USD'], ["MSFT", 280, "USD"]] } }));
}