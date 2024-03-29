import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SubscribeAssetsResponse } from '../response/subscribeAssets.response';

export function Api_subscribeAssets() {
  return applyDecorators(
    ApiOperation({ summary: 'Subscribe Assets', description: 'ticker 배열로 Assets 를 구독합니다.' }),
    ApiBody({ type: [String], description: 'ticker 배열', required: true, examples: { 
        '1': { summary: "Array of Tickers", description: "ticker로 이루어진 배열입니다.",  value: ['aapl', 'msft']},
        '2': { summary: "대소문자", description: "대소문자를 구별하지 않으며 중복된 티커는 무시됩니다. 위 예시는 [ 'AAPL' ] 과 결과적으로 동일합니다.",  value: ['aapl', 'AAPL', 'aApL', 'Aapl']},
        '3': { summary: "국가코드", description: "티커는 거래소별로 중복될 우려가 있으므로 미국 이외 국가 거래소의 티커는 예시와 같이 국가코드를 더해야합니다.\n\n국가코드는 Yahoo Finance 를 따르고 있습니다.", value: ['005930.KS', 'ADS.DE']},}}),
    ApiOkResponse({ description: '작업 결과를 응답합니다.\n\n생성된 Assets의 정보와 새로운 거래소를 발견한 경우, 생성된 status_price 를 포함합니다.\n\n생성 실패한 ticker에 대한 정보와 새로운 거래소를 발견한 경우, status_price 추가작업에서의 실패정보를 포함합니다.', type: SubscribeAssetsResponse }));
}