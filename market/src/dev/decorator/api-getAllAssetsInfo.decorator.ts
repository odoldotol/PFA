import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_getAllAssetsInfo() {
  return applyDecorators(
    ApiOperation({ summary: 'Get All Assets Info', description: '' }));
}