import { ApiProperty } from "@nestjs/swagger";
import { ExchangeIsoCode, FinancialAssetCore } from "src/common/interface";

// Todo: API npm
export class GetPriceByTickerResponse {
    
    @ApiProperty({type: Number, example: 160})
    readonly price: number;

    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code: ExchangeIsoCode | null; //

    @ApiProperty({type: String, example: 'USD'})
    readonly currency: string;

    constructor(
        finAsset: FinancialAssetCore
    ) {
        this.price = finAsset.regularMarketLastClose;
        this.ISO_Code = finAsset.exchange; //
        this.currency = finAsset.currency;
    }
}