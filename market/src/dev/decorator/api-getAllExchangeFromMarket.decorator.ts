import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllExchangeFromMarket() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Exchange From Market', description: '' }));
}