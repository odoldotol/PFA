import { CachedPrice } from "src/common/class/cachedPrice.class";
import { applyDecorators } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";

export const Api_getPrice = () => applyDecorators(
    ApiOperation({ summary: 'Get Price By Ticker', description: 'ticker 로 항목의 price를 검색합니다.' }),
    ApiParam({ name: 'ticker', description: '검색 할 ticker를 입력하세요.', examples: {
        '1': { summary: "AAPL", description: "ticker는 짧은 문자열로 이루어진 코드입니다.",  value: 'AAPL' },
        '2': { summary: "aApL", description: "대소문자를 구별하지 않습니다. 위 예시는 'AAPL' 과 결과적으로 동일합니다.",  value: 'aApL' },
        '3': { summary: "005930.KS", description: "티커는 거래소별로 중복될 우려가 있으므로 미국 이외 국가 거래소의 티커는 예시와 같이 국가코드를 더해야합니다.\n\n국가코드는 Yahoo Finance 를 따르고 있습니다.", value: '005930.KS' },}}),
    ApiQuery({ name: 'id', required: false, description: '요청 주체의 id입니다. 입력지 않아도 됩니다.' }),
    ApiOkResponse({ description: '요청한 ticker의 price를 반환합니다.', type: CachedPrice }));