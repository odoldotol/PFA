import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllExchangesFromDatabase() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Exchanges From Database', description: '' }));
}