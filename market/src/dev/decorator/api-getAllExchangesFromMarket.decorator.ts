import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllExchangesFromMarket() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Exchanges From Market', description: '' }));
}