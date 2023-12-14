import { ApiProperty } from "@nestjs/swagger";
import { ExchangeIsoCode } from "src/common/interface";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";

// Todo: API npm
export class GetPriceByTickerResponse {
    
    @ApiProperty({type: Number, example: 160})
    readonly price: number;

    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code?: ExchangeIsoCode; //

    @ApiProperty({type: String, example: 'USD'})
    readonly currency: string;

    constructor(
        finAsset: FinancialAsset
    ) {
        this.price = finAsset.regularMarketLastClose;
        this.ISO_Code = finAsset.exchange; //
        this.currency = finAsset.currency;
    }
}