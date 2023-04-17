import { ApiProperty } from "@nestjs/swagger";
import { MarketDate } from "./marketDate.class";

export class CachedPrice implements CachedPriceI {

    @ApiProperty({type: Number, example: 160})
    readonly price: number;
    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code: ISO_Code;
    @ApiProperty({type: String, example: 'USD'})
    readonly currency: Currency;
    @ApiProperty({type: String, example: '2023-03-25'})
    readonly marketDate: MarketDate;
    @ApiProperty({type: Number, example: 1, description: '일간 조회수'})
    readonly count: number;

    constructor(price: CachedPriceI) {
        this.price = price.price;
        this.ISO_Code = price.ISO_Code;
        this.currency = price.currency;
        this.marketDate = new MarketDate(price.marketDate);
        this.count = price.count;
    }

    // @ts-ignore
    counting() {this.count++; return this;}

}