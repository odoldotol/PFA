import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

export function Api_initiateForce() {
  return applyDecorators(
    ApiOperation({
        summary: 'Force to Initiate',
        description: '해당 ISO_Code에 대하여 강제로 Updater의 초기화를 진행합니다.',
        externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }}),
    ApiParam({ name: 'ISO_Code', description: 'Exchange ISO_Code', required: true, example: 'XNYS' }),
    ApiQuery({ name: 'launcher', description: '업데이트 launcher', required: true, enum: ["initiator", "scheduler", "admin", "product", "test"],  example: 'test' })); // TODO: enum 부분 참조하도록 Refac
}