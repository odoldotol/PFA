import { ApiProperty } from "@nestjs/swagger";
import { TExchangeCore } from "src/common/type/exchange.type";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";

export class GetPriceByTickerResponse {
    
    @ApiProperty({type: Number, example: 160})
    readonly price: number;

    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code?: string;

    @ApiProperty({type: String, example: 'USD'})
    readonly currency: string;

    // TODO - 제거되어야함. 상위클래스로 묶어야함. getPriceByTicker 함수 리팩터링 필요.
    // @ApiProperty({required: false})
    readonly newExchange?: TExchangeCore; // Todo: Refac

    constructor(
        finAsset: FinancialAsset,
        exchange?: TExchangeCore
    ) {
        this.price = finAsset.regularMarketLastClose;
        this.ISO_Code = finAsset.exchange;
        this.currency = finAsset.currency;
        this.newExchange = exchange;
    }
}