import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class RegularUpdateForPriceBodyDto implements RegularUpdatePrice {
    
    @IsNotEmpty()
    @IsString()
    readonly ISO_Code: ISO_Code;

    @IsNotEmpty()
    @IsString()
    readonly marketDate: string;

    @IsOptional()
    @IsObject()
    readonly marketDateClass: MarketDateI;    

    @IsNotEmpty()
    @IsArray()
    readonly priceArrs: SymbolPrice[];

};