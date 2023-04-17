import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam } from "@nestjs/swagger";

export const Api_updatePriceByExchange = () => applyDecorators(
    ApiOperation({
        summary: 'Update Price by Exchange',
        description: '해당 ISO_Code에 대하여 price 를 업데이트합니다.',
        externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }}),
    ApiParam({ name: 'ISO_Code', description: 'Exchange ISO_Code', required: true, example: 'XNYS' }));