import { applyDecorators } from "@nestjs/common";
import {
  ApiOperation,
  ApiParam
} from "@nestjs/swagger";

export const Api_renewExchange = () => applyDecorators(
  ApiOperation({
    summary: 'Renew FianancialAsset and MarketDate of an Exchange',
    description: '해당 ISO_Code 에 대하여 FianancialAssets 를 갱신합니다.',
    externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }
  }),
  ApiParam({ name: 'ISO_Code', description: 'Exchange ISO_Code', required: true, example: 'XNYS' }),
);