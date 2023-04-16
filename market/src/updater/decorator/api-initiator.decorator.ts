import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export function Api_initiator() {
  return applyDecorators(
    ApiOperation({ summary: 'Re-Launch Updater', description: '모든 Updater를 재실행합니다.' }));
}