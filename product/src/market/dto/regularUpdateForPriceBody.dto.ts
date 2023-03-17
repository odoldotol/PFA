import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class RegularUpdateForPriceBodyDto implements RegularUpdatePrice {
    
    @IsNotEmpty()
    @IsString()
    readonly marketDate: string;

    @IsNotEmpty()
    @IsArray()
    readonly priceArrs: SymbolPrice[];

};