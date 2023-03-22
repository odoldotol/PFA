import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class RegularUpdateForPriceBodyDto implements RegularUpdatePrice {
    
    @IsNotEmpty()
    @IsString()
    readonly ISO_Code: ISO_Code;

    @IsNotEmpty()
    @IsString()
    readonly marketDate: MarketDate;

    @IsNotEmpty()
    @IsArray()
    readonly priceArrs: SymbolPrice[];

};