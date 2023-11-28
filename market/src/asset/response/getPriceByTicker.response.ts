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

    readonly newExchange?: TExchangeCore; // 제거될 예정

    constructor(
        finAsset: FinancialAsset,
        exchange?: TExchangeCore // 제거될 예정
    ) {
        this.price = finAsset.regularMarketLastClose;
        this.ISO_Code = finAsset.exchange;
        this.currency = finAsset.currency;
        this.newExchange = exchange; // 제거될 예정
    }
}