import { ApiProperty } from "@nestjs/swagger";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";

export class GetPriceByTickerResponse {
    
    @ApiProperty({type: Number, example: 160})
    readonly price: number;

    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code?: string;

    @ApiProperty({type: String, example: 'USD'})
    readonly currency: string;

    constructor(
        finAsset: FinancialAsset
    ) {
        this.price = finAsset.regularMarketLastClose;
        this.ISO_Code = finAsset.exchange;
        this.currency = finAsset.currency;
    }
}