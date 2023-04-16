import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllStatusPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Status_Price Info', description: '' }));
}