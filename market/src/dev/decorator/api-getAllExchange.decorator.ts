import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllExchange() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Exchange Of Server', description: '' }));
}