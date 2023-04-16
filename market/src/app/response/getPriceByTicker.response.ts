import { ApiProperty } from "@nestjs/swagger";

export class ResponseGetPriceByTicker {
    
    @ApiProperty({type: Number, example: 160})
    readonly price: number;

    @ApiProperty({type: String, example: 'XNYS'})
    readonly ISO_Code: string;

    @ApiProperty({type: String, example: 'USD'})
    readonly currency: string;

    // TODO
    // @ApiProperty({required: false})
    readonly status_price?: StatusPrice;

    constructor(
        price: number,
        ISO_Code: string,
        currency: string,
        status_price?: StatusPrice
    ) {
        this.price = price;
        this.ISO_Code = ISO_Code;
        this.currency = currency;
        this.status_price = status_price;
    }
}