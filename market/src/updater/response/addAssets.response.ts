import { ApiProperty } from "@nestjs/swagger";

export class AddAssetsResponse {
    
    @ApiProperty({ type: Object, example: {info: [{
		"symbol": "MSFT",
		"exchangeTimezoneName": "America/New_York",
		"shortName": "Microsoft Corporation",
		"longName": "Microsoft Corporation",
		"market": "us_market",
		"currency": "USD",
		"exchange": "NMS",
		"quoteType": "EQUITY"
	}], status_price: []}, description: '생성된 Assets의 정보와 새로운 거래소를 발견한 경우, 생성된 status_price 를 포함합니다.' })
    readonly success: {
        info: FulfilledYfInfo[],
        status_price: StatusPrice[],
    };

    @ApiProperty({ type: Object, example: {info: [{
        "msg": "Already exists",
        "ticker": "AAPL"
    }], status_price: []}, description: '생성 실패한 ticker에 대한 정보와 새로운 거래소를 발견한 경우, status_price 추가작업에서의 실패정보를 포함합니다.'})
    readonly failure: {
        info: any[],
        status_price: any[],
    };

    constructor() {
        this.success = {
            info: [],
            status_price: [],
        };
        this.failure = {
            info: [],
            status_price: [],
        };}
}